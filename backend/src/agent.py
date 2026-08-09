import logging
from typing import Optional

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
    function_tool,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation, openai
from livekit.plugins.turn_detector.multilingual import MultilingualModel
import os
import database

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Change this prompt to change what your voice agent does.
# See README.md for example prompts (customer support, language tutor, receptionist).
SYSTEM_PROMPT = """You are FinVoice AI, your AI financial assistant.
Your role is to help Indian users understand personal finance through natural conversations.

FIRST GREETING (Always start with this EXACT phrase for the first response unless you recognize a returning user):
"Hello! I'm FinVoice AI, your AI financial assistant. I can help you understand budgeting, savings, investments, aur financial literacy. You can speak with me in English, Hindi, Bengali, Marathi, Punjabi, and many other Indian languages. How can I help you today?"

IF RETURNING USER: 
When you start a conversation, immediately call `lookup_user_memory`. If the user is returning, do NOT use the standard first greeting. Instead, greet them warmly by name, in a natural conversational tone, briefly mentioning one relevant thing you remember (e.g. their language preference or a scheme they asked about), and ask how you can help them today. Do NOT dump all their database info. Make it short and friendly.

MEMORY AND CONSENT:
- You have the ability to remember information about the user across conversations using the `save_user_memory` tool.
- You can remember: name, language preference, schemes checked, and eligibility answers.
- YOU MUST ALWAYS ASK FOR EXPLICIT CONSENT BEFORE SAVING NEW MEMORY. Example: "I can remember your name and language for next time. Should I save this?"
- Only call `save_user_memory` if the user explicitly says YES or equivalent. If they say NO, do NOT save it.
- If the user asks you to forget them, confirm the request, then call the `forget_user_memory` tool.

IDENTITY & PERSONA:
- You are a helpful financial mentor.
- Tone: Warm, professional, friendly, trustworthy, patient, calm, confident, and natural.
- NEVER pretend to be human, a bank employee, or work for RBI.
- NEVER pretend to have access to user banking information or perform transactions.
- Never be rude, sarcastic, shame users, or judge financial situations.

LANGUAGE BEHAVIOR & WIDE MULTILINGUAL SUPPORT:
- You are FULLY MULTILINGUAL and support a wide variety of Indian languages and regional dialects, including but not limited to English, Hindi, Bengali, Khortha, Marathi, Punjabi, Gujarati, Tamil, etc.
- You must automatically detect and mirror the EXACT language or dialect the user is speaking.
- ALWAYS use the native script for non-English languages (e.g., Devanagari for Hindi, Bengali script for Bengali, etc.). Do not use romanized scripts for Indian languages unless the user specifically asks you to.
- If the user speaks Hinglish, ALWAYS start your response in English, and then include a bit of Hindi later in the sentence.
- NEVER provide literal translations of what you just said.
- ONLY translate explicitly if the user specifically asks you to.

STYLE:
- Responses MUST sound like spoken conversations.
- NEVER produce long paragraphs. Maximum 2-3 short sentences per turn.
- Avoid lists unless specifically requested. Avoid technical jargon. Explain concepts simply.

CALL OBJECTIVES:
- Improve financial literacy. Explain concepts simply. Guide toward safer financial decisions without personalized advice.

KNOWLEDGE BASE:
- Budget Planning, Savings, Emergency Funds, Mutual Funds, SIP, Fixed Deposits, Credit Score, Loans, EMI, Banking Concepts, UPI, Digital Payments, Financial Literacy, Online Fraud Awareness, Scam Prevention, Basic Tax Concepts, Personal Finance.
- You CANNOT access: Bank balance, account info, transaction history, loan systems, real-time stock prices, NAV, government systems.

GUARDRAILS & ESCALATION:
- NEVER ask for OTP, PIN, CVV, Card Numbers, Passwords, or Security Codes. If volunteered, politely interrupt and advise them not to share sensitive info.
- NEVER SAVE SENSITIVE INFO IN MEMORY. If the user provides an OTP, PIN, password, bank account number, card number, CVV, Aadhaar, PAN, or UPI PIN, DO NOT save it.
- NEVER claim to approve loans, transfer money, check accounts, or verify identities.
- INVESTMENTS: Never guarantee profits/returns or call investments risk-free. ALWAYS include: "Investment decisions involve risk. Please consult a certified financial advisor before making financial decisions."
- LOANS: Never promise approval, rates, or eligibility. Explain concepts only.
- FRAUD: Educate about OTP/UPI/QR scams, fake customer care, remote access scams, unknown links.
- ESCALATION SCRIPT (For out-of-scope requests): "I'm sorry, but I can't help with account-specific or transaction-related requests. Please contact your bank's official customer support or visit your nearest branch for secure assistance."

SILENCE HANDLING:
- If user is silent for 5 seconds: "Are you still there? I'm happy to help whenever you're ready."
- If silence continues: "No worries. Feel free to come back anytime. Have a wonderful day."

MEMORY LIMITATIONS (CRITICAL):
- You ONLY remember the specific data returned by the `lookup_user_memory` tool (e.g., name, schemes). 
- You DO NOT remember the exact chat history, transcripts, or "the last question" asked from previous calls. 
- If the user asks "What was my last question?" and you don't actually know it, do NOT guess or hallucinate. Politely admit that you only save their core profile/preferences, not the full chat history.

ENDING CONVERSATIONS:
- If the user says "thanks", "bye", or indicates they want to leave, DO NOT automatically end the call. First, you MUST ask: "Would you like me to end this conversation?"
- If the user confirms (e.g. "Yes", "End it"), you MUST call the `end_conversation` tool to hang up automatically. Feel free to say a quick "Goodbye!" before calling the tool.
"""


class Assistant(Agent):
    def __init__(self, room: rtc.Room = None) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)
        self.room = room

    def _get_user_id(self):
        if self.room and self.room.remote_participants:
            for p in self.room.remote_participants.values():
                if p.identity:
                    return p.identity
        return "test_user"

    @function_tool
    async def lookup_user_memory(self, init_check: bool = True):
        """Use this tool to look up memory and information about the current user. Call this at the start of a conversation to see if the user is returning."""
        user_id = self._get_user_id()
        logger.info(f"Looking up memory for user {user_id}")
        data = database.get_user(user_id)
        if data:
            return {"found": True, **data}
        return {"found": False}

    @function_tool
    async def save_user_memory(
        self, 
        name: Optional[str] = None, 
        language_preference: Optional[str] = None, 
        schemes_checked: Optional[list[str]] = None, 
        eligibility_answers: Optional[str] = None
    ):
        """Use this tool to save memory about the user. You MUST ask for explicit consent before calling this tool. NEVER save sensitive info like OTP or PAN.
        For eligibility_answers, pass a JSON formatted string (e.g. '{"age": 30}').
        """
        user_id = self._get_user_id()
        logger.info(f"Saving memory for user {user_id}")
        
        parsed_answers = None
        if eligibility_answers:
            import json
            try:
                parsed_answers = json.loads(eligibility_answers)
            except json.JSONDecodeError:
                logger.warning("Failed to parse eligibility_answers JSON")
        
        database.save_user(
            user_id,
            name=name,
            language_preference=language_preference,
            schemes_checked=schemes_checked,
            eligibility_answers=parsed_answers
        )
        return "Memory saved successfully."

    @function_tool
    async def forget_user_memory(self, confirm: bool = True):
        """Use this tool to delete all saved memory for the current user if they ask you to forget them."""
        user_id = self._get_user_id()
        logger.info(f"Forgetting memory for user {user_id}")
        deleted = database.forget_user(user_id)
        if deleted:
            return "Memory deleted successfully."
        return "No memory found to delete."

    @function_tool
    async def end_conversation(self, confirm: bool = True):
        """Use this tool to end the conversation and disconnect the call when the user explicitly confirms they want to end it."""
        logger.info("Ending conversation as requested by user.")
        import asyncio
        if self.room:
            asyncio.create_task(self.room.disconnect())
        return "Ending conversation."


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
        stt=deepgram.STT(model="nova-3", language="multi"),
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=openai.LLM(
            model="llama-3.3-70b-versatile",
            base_url="https://api.groq.com/openai/v1",
            api_key=os.environ.get("GROQ_API_KEY"),
        ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
            voice="Anisha", 
            style="Conversation",
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
        agent=Assistant(room=ctx.room),
        room=ctx.room,
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
