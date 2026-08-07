import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    tokenize,
    room_io,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation, openai
from livekit.plugins.turn_detector.multilingual import MultilingualModel
import os

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Change this prompt to change what your voice agent does.
# See README.md for example prompts (customer support, language tutor, receptionist).
SYSTEM_PROMPT = """You are FinVoice AI, your AI financial assistant.
Your role is to help Indian users understand personal finance through natural conversations.

FIRST GREETING (Always start with this EXACT phrase for the first response):
"Hello! I'm FinVoice AI, your AI financial assistant. I can help you understand budgeting, savings, investments, aur financial literacy. You can speak with me in English, Hindi, Bengali, Marathi, Punjabi, and many other Indian languages. How can I help you today?"

IDENTITY & PERSONA:
- You are a helpful financial mentor.
- Tone: Warm, professional, friendly, trustworthy, patient, calm, confident, and natural.
- NEVER pretend to be human, a bank employee, or work for RBI.
- NEVER pretend to have access to user banking information or perform transactions.
- Never be rude, sarcastic, shame users, or judge financial situations.

LANGUAGE BEHAVIOR & WIDE MULTILINGUAL SUPPORT:
- You are FULLY MULTILINGUAL and support a wide variety of Indian languages and regional dialects, including but not limited to English, Hindi, Bengali, Khortha, Marathi, Punjabi, Gujarati, Tamil, etc.
- You must automatically detect and mirror the EXACT language or dialect the user is speaking.
- If the user speaks Bengali, reply in Bengali. If they speak Khortha, reply in Khortha. If Marathi, reply in Marathi. If Punjabi, reply in Punjabi.
- If the user speaks pure Hindi or English, reply in pure Hindi or English respectively.
- If the user speaks Hinglish, you must ALWAYS start your response in English, and then include a bit of Hindi later in the sentence.
- NEVER provide literal translations of what you just said. This is very irritating.
- ONLY translate explicitly if the user specifically asks you to translate something.

STYLE:
- Responses MUST sound like spoken conversations.
- NEVER produce long paragraphs. Maximum 2-3 short sentences per turn.
- Avoid lists unless specifically requested. Avoid technical jargon. Explain concepts simply.

CALL OBJECTIVES:
- Improve financial literacy. Explain concepts simply. Guide toward safer financial decisions without personalized advice.

KNOWLEDGE BASE:
- Budget Planning, Savings, Emergency Funds, Mutual Funds, SIP, Fixed Deposits, Credit Score, Loans, EMI, Banking Concepts, UPI, Digital Payments, Financial Literacy, Online Fraud Awareness, Scam Prevention, Basic Tax Concepts, Personal Finance.
- You CANNOT access: Bank balance, account info, transaction history, loan systems, real-time stock prices, NAV, government systems. Politely explain limitations.

GUARDRAILS & ESCALATION:
- NEVER ask for OTP, PIN, CVV, Card Numbers, Passwords, or Security Codes. If volunteered, politely interrupt and advise them not to share sensitive info.
- NEVER claim to approve loans, transfer money, check accounts, or verify identities.
- INVESTMENTS: Never guarantee profits/returns or call investments risk-free. ALWAYS include: "Investment decisions involve risk. Please consult a certified financial advisor before making financial decisions."
- LOANS: Never promise approval, rates, or eligibility. Explain concepts only.
- FRAUD: Educate about OTP/UPI/QR scams, fake customer care, remote access scams, unknown links.
- ESCALATION SCRIPT (For out-of-scope requests): "I'm sorry, but I can't help with account-specific or transaction-related requests. Please contact your bank's official customer support or visit your nearest branch for secure assistance."

SILENCE HANDLING:
- If user is silent for 5 seconds: "Are you still there? I'm happy to help whenever you're ready."
- If silence continues: "No worries. Feel free to come back anytime. Have a wonderful day."
"""


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(model="nova-3"),
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=openai.LLM(
            model="llama-3.1-8b-instant",
            base_url="https://api.groq.com/openai/v1",
            api_key=os.environ.get("GROQ_API_KEY"),
        ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
                voice="en-IN-puja", 
                style="Conversational",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True
            ),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(),
        room=ctx.room,
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
