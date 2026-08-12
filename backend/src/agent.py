import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

import logging
import os
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
    function_tool,
)
from livekit.plugins import deepgram, murf, openai, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

import database
import schemes_data

logger = logging.getLogger("agent")

load_dotenv(".env.local")

SYSTEM_PROMPT = """
You are Anisha, an AI from FinVoice.
You are a helpful, professional, and knowledgeable financial assistant.
NEVER output code, JSON, markdown, or mathematical terms. Respond with natural conversational English ONLY.

OTP & SECURITY RULES (CRITICAL):
- You MUST NEVER collect or handle OTPs, passwords, PINs, or banking credentials.
- If the user asks you to take an OTP or complete an application for them, YOU MUST REFUSE and say exactly something like: "I can't collect or handle OTPs or banking credentials. I can explain the application steps, but you'll need to complete the secure part yourself."

IDENTITY:
- Tone: Professional, warm, concise. 
- You support Hinglish/English. Mirror the user's language/register where appropriate (English, Hindi, Bengali, Code-mixed speech).
- Maximum 1-2 short sentences per response. Keep it very conversational.

HUMAN ESCALATION POLICY:
You are not responsible for solving every financial problem. You must recognize when a human should take over.
Escalate when:
1. The user reports possible fraud or suspicious financial activity.
2. The user asks for a financial decision or approval that you do not have authority to make.

Before creating an escalation:
1. Explain why human assistance is appropriate.
2. Explain what information will be shared.
3. Explicitly ask for permission (e.g. "Would you like me to create a support request?").
4. Wait for the user's answer.
5. Only call `create_escalation` after explicit consent.

If the user says NO, respect their decision and do not create the escalation.
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

    @function_tool
    async def check_scheme_eligibility(
        self,
        state: Optional[str] = None,
        occupation: Optional[str] = None,
        age: Optional[int] = None,
        gender: Optional[str] = None
    ):
        """Use this tool to determine which government financial schemes the user may be eligible for based on their circumstances.
        CALL THIS TOOL when:
        - the user asks whether they qualify for government financial schemes
        - the user asks which government schemes are suitable for them
        - the user wants an eligibility check
        - the user asks about scheme benefits based on their circumstances
        DO NOT call this tool for general questions or investment advice.
        If required information is missing, ask the user for the minimum necessary information before calling this.
        USE SAVED MEMORY (lookup_user_memory) if available to avoid asking the user for information they already provided.
        """
        logger.info(f"Checking scheme eligibility: state={state}, occupation={occupation}, age={age}, gender={gender}")
        try:
            results = schemes_data.search_schemes(state=state, occupation=occupation, age=age, gender=gender)

            # Send results to frontend via data channel
            if self.room and self.room.local_participant:
                import json
                payload = json.dumps({
                    "type": "scheme_results",
                    "data": results
                }).encode('utf-8')
                await self.room.local_participant.publish_data(payload)

            # Return a tiny summary to the LLM so it doesn't bloat the context window
            scheme_count = len(results.get("schemes", []))
            scheme_names = ", ".join([s["name"] for s in results.get("schemes", [])])
            return f"Found {scheme_count} schemes: {scheme_names}. The UI has been updated with full details. Tell the user you found these matches and give a VERY brief 30-word intro overall without explaining each one fully yet. Wait for them to ask for more details."
        except Exception as e:
            logger.error(f"Error checking schemes: {e}")
            return {"success": False, "error": "Service temporarily unavailable"}

    @function_tool
    async def create_escalation(
        self,
        reason: str,
        summary: str,
        what_happened: str,
        what_agent_checked: str,
        urgency: str,
        language: str,
        preferred_follow_up: str = "phone"
    ):
        """Use this tool ONLY after explicit permission from the user to escalate the issue to a human.
        reason: Must be either 'possible_fraud' or 'decision_required'
        summary: Short useful summary of the issue
        what_happened: Details about what the user reported
        what_agent_checked: Details about what FinVoice checked or explained
        urgency: 'low', 'medium', 'high', or 'emergency'. Use 'high' for possible fraud, 'medium' for decision required.
        language: The caller's language
        preferred_follow_up: 'phone', 'email', or 'other'
        """
        user_id = self._get_user_id()
        logger.info(f"Creating escalation for user {user_id}, reason: {reason}")
        try:
            reference_id = database.create_escalation(
                user_id=user_id,
                reason=reason,
                summary=summary,
                what_happened=what_happened,
                what_agent_checked=what_agent_checked,
                urgency=urgency,
                language=language,
                preferred_follow_up=preferred_follow_up
            )

            # Send reference ID to frontend via data channel
            if self.room and self.room.local_participant:
                import json
                payload = json.dumps({
                    "type": "escalation_created",
                    "data": {
                        "reference_id": reference_id,
                        "user_id": user_id,
                        "summary": summary
                    }
                }).encode('utf-8')
                await self.room.local_participant.publish_data(payload)

            return f"Success. Escalate reference ID is {reference_id}. Tell the user exactly: 'Your support request has been created. Your reference number is {reference_id}. A support representative can review the request through the support system.'"
        except Exception as e:
            logger.error(f"Error creating escalation: {e}")
            return "Failed to create escalation. Tell the user: 'I'm unable to create the support request right now. Please try again later.'"



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
        stt=deepgram.STT(model="nova-2-general", language="en-IN"),
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
        preemptive_generation=False,
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
        room=ctx.room
    )

    async def handle_sip_participant(participant: rtc.RemoteParticipant):
        if (participant.identity and participant.identity.startswith("sip")) or getattr(participant, "kind", None) == rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
            logger.info("SIP Participant connected! Triggering outbound context...")

            # Fetch latest active outbound call for real data
            active_call = None
            for call in database.get_outbound_calls():
                if call['status'] in ['initiated', 'ringing', 'connected', 'answered']:
                    active_call = call
                    break

            user_name = "User"
            reason = "a follow up"
            if active_call:
                user_id = active_call.get('user_id', '')
                if '-' in user_id:
                    user_name = user_id.split('-')[0].capitalize()
                reason = active_call.get('reason', 'a follow up')

            outbound_prompt = f"""
[CRITICAL SYSTEM OVERRIDE]
You are now making a PROACTIVE OUTBOUND PHONE CALL to a user named {user_name}.
Reason for this call: {reason}.
Act as the initiator. Keep your tone warm and professional. 
Do not wait for them to ask a question, you are the one calling them!
If the user says "stop", "don't call me", or asks to opt out, apologize briefly and call `end_conversation`.
"""
            from livekit.agents.llm import ChatMessage
            session.chat_ctx.messages.append(ChatMessage(role="system", content=outbound_prompt))

            greeting = f"Hi {user_name}, this is Anisha calling from FinVoice. I'm calling regarding {reason}. Are you available to speak?"
            session.say(greeting, add_to_chat_ctx=True)

    @ctx.room.on("participant_connected")
    def on_participant_connected(participant: rtc.RemoteParticipant):
        import asyncio
        asyncio.create_task(handle_sip_participant(participant))

    # Join the room and connect to the user
    await ctx.connect()

    # Greet any SIP participants already in the room
    import asyncio
    for participant in ctx.room.remote_participants.values():
        if (participant.identity and participant.identity.startswith("sip")) or getattr(participant, "kind", None) == rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
            asyncio.create_task(handle_sip_participant(participant))
            break


if __name__ == "__main__":
    cli.run_app(server)
