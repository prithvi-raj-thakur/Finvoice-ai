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
You are Anisha, a Voice-First Financial Access Companion for FinVoice.
Your goal is to guide the user through a COMPLETE FINANCIAL JOURNEY:
UNDERSTAND -> DISCOVER -> CHECK -> EXPLAIN -> REMEMBER -> ACT -> ESCALATE.

IMPORTANT RULES:
1. Speak conversationally (English, Hindi, Code-Mixed). NEVER output markdown or long paragraphs. Keep it to 1-3 short sentences.
2. If the user interrupts, adjust instantly.
3. If they ask to "explain simply" or "explain in Hindi", adapt your complexity and language dynamically.

--- 1. FINANCIAL INTENT & ELIGIBILITY ENGINE ---
Do not interrogate with long forms. If a user says "I need help", intelligently narrow down the intent. Ask ONE question at a time (e.g. "Aap student hain, farmer hain, ya business chalate hain?").
Check eligibility conversationally. Use `check_scheme_eligibility` when you have basic info.

--- 2. SCHEME MATCHING & EXPLANATION (WHY ENGINE) ---
When returning schemes, DO NOT just list them. Explain WHY it fits: "Based on what you told me, this is relevant because you're a student..."
NEVER GUARANTEE APPROVAL. Always say: "Based on the information provided, you appear to meet initial criteria. Official approval depends on verification."

--- 3. DOCUMENT CHECKLIST & NEXT BEST ACTION ---
End scheme explanations with a NEXT BEST ACTION.
Example: "Your next step is to get your income certificate. Would you like me to explain how?"
Do not invent documents; rely on what the tool returns.

--- 4. SCAM SHIELD ---
If the user mentions OTP, PIN, CVV, or someone asking for money, recognize it as potential fraud.
Say: "Please do not share your OTP or PIN. This may be a scam."

--- 5. SOURCE TRANSPARENCY & UNCERTAINTY ---
Whenever asked about details you don't know, DO NOT hallucinate.
Say: "I don't have enough verified information to answer that confidently."

--- 6. MEMORY & FINANCIAL JOURNEY ---
Use `save_user_memory` ONLY AFTER EXPLICIT CONSENT.
If they ask "What do you remember?", use `lookup_user_memory`.
Use `forget_user_memory` if they ask to stop remembering.

--- 7. HUMAN ESCALATION ---
Escalate when: fraud is suspected, verification is required, or explicitly requested.
ALWAYS ask for consent before escalating.
"""

class Assistant(Agent):
    def __init__(self, room: rtc.Room = None) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)
        self.room = room
        self.success_reason = None
        self.failure_reason = None

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

        # Include open escalations for follow-up context
        open_escalation = None
        try:
            escalations = database.get_escalations()
            for esc in escalations:
                if esc['user_id'] == user_id and esc['status'] in ['OPEN', 'IN REVIEW']:
                    open_escalation = {
                        "reference_id": esc['reference_id'],
                        "status": esc['status'],
                        "reason": esc['reason']
                    }
                    break
        except Exception as e:
            logger.warning(f"Failed to fetch escalations: {e}")

        if data:
            return {"found": True, "open_escalation": open_escalation, **data}
        return {"found": False, "open_escalation": open_escalation}

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
        self.failure_reason = "user_hangup" # If not overridden by success later or before
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
            self.success_reason = "scheme_discovered"
            return f"Found {scheme_count} schemes: {scheme_names}. The UI has been updated with full details. Tell the user you found these matches and give a VERY brief 1-2 sentence intro explaining WHY they match based on what the user told you. Tell the user you can explain the eligibility criteria and documents needed, and ask what they want to do next."
        except Exception as e:
            logger.error(f"Error checking schemes: {e}")
            self.failure_reason = "tool_failure"
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

            self.success_reason = "human_escalation_created"
            return f"Success. Escalate reference ID is {reference_id}. Tell the user exactly: 'Your support request has been created. Your reference number is {reference_id}. A support representative can review the request through the support system.'"
        except Exception as e:
            logger.error(f"Error creating escalation: {e}")
            self.failure_reason = "tool_failure"
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
    assistant = Assistant(room=ctx.room)
    await session.start(
        agent=assistant,
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

    # Initialize Analytics
    call_id = ctx.room.name
    channel = "browser"

    # Check if there are any SIP participants immediately available
    for participant in ctx.room.remote_participants.values():
        if (participant.identity and participant.identity.startswith("sip")) or getattr(participant, "kind", None) == rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
            channel = "twilio"
            break

    try:
        user_id = assistant._get_user_id()
        database.create_call_analytics(call_id=call_id, user_id=user_id, channel=channel)
    except Exception as e:
        logger.error(f"Failed to create call analytics: {e}")

    @ctx.room.on("disconnected")
    def on_disconnected(*args, **kwargs):
        logger.info(f"Room {ctx.room.name} disconnected. Updating analytics.")
        try:
            if assistant.success_reason:
                outcome = assistant.success_reason.upper()
                failure_reason = None
            else:
                failure_reason = assistant.failure_reason or "incomplete_task"
                if failure_reason == "user_hangup":
                    outcome = "USER_ABANDONED"
                elif failure_reason == "tool_failure":
                    outcome = "TOOL_FAILURE"
                else:
                    outcome = "FAILED"

            database.update_call_analytics(
                call_id=call_id,
                outcome=outcome,
                success_reason=assistant.success_reason,
                failure_reason=failure_reason
            )
        except Exception as e:
            logger.error(f"Failed to update call analytics on disconnect: {e}")

    # Greet any SIP participants already in the room
    import asyncio
    for participant in ctx.room.remote_participants.values():
        if (participant.identity and participant.identity.startswith("sip")) or getattr(participant, "kind", None) == rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
            asyncio.create_task(handle_sip_participant(participant))
            break


if __name__ == "__main__":
    cli.run_app(server)
