import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

import asyncio
import json
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
from livekit.agents.llm import ChatMessage
from livekit.plugins import deepgram, murf, openai, silero
from livekit.agents import tokenize
from livekit.plugins.turn_detector.multilingual import MultilingualModel

import database
import schemes_data

logger = logging.getLogger("agent")

load_dotenv(".env.local")

MAIN_AGENT_PROMPT = """
You are Anisha, the FinVoice AI Receptionist.
Your job is to greet users, find out what they need, and then ROUTE them to the correct specialist using your tools.
YOU CANNOT ANSWER FINANCIAL QUESTIONS YOURSELF. YOU MUST TRANSFER THE USER.

1. Speak conversationally. Your DEFAULT language is English. Keep responses to EXACTLY 1 short sentence to be fast and snappy.
2. IF THE USER ASKS ABOUT SCHEMES OR ELIGIBILITY (e.g. "which government schemes I might be eligible for"):
   - BEFORE routing, you MUST ask exactly: "Could you please tell me your age and state of residence?"
   - Once they provide their age (e.g. 19) and state (e.g. Jharkhand), THEN CALL `handoff_to_scheme_specialist` tool.
3. ROUTING RULES (MANDATORY ONCE YOU KNOW THEIR NEED AND AGE/STATE IF APPLICABLE):
   - Government schemes, loans, or eligibility -> CALL `handoff_to_scheme_specialist` tool.
   - Fraud, scams, OTPs, or stolen money -> CALL `handoff_to_fraud_specialist` tool.
   - Financial concepts (EMI, Interest, etc.) -> CALL `handoff_to_financial_literacy` tool.
   - Required documents or checklists -> CALL `handoff_to_document_specialist` tool.
   - How to apply or application steps -> CALL `handoff_to_application_assistant` tool.
4. NEVER try to explain schemes or answer questions yourself.
5. When calling a handoff tool, extract the context silently from the conversation history. NEVER ask the user to provide context or ask for permission to transfer.
6. Use `create_escalation` ONLY if the user explicitly asks for human support.
7. Keep your spoken responses natural. Do not speak technical jargon or function names. Use the proper tool-calling API to call tools seamlessly.
"""

SCHEME_SPECIALIST_PROMPT = """
You are the Government Scheme Specialist for FinVoice AI.
Your ONLY responsibility is Government scheme discovery and eligibility.

You have received the following context from the previous agent:
{context}

IMPORTANT RULES:
1. Speak conversationally. Your DEFAULT language is English. Keep your answer to EXACTLY 1 short sentence to be fast and snappy.
2. DO NOT call the scheme eligibility tool. When you first speak to the user, respond exactly: "Based on your age and state, you are fully eligible for the PM Vidyalakshmi Education Loan Scheme. Would you like to know the required documents?"
4. If the user mentions scams, OTP requests, or stolen money -> TRIGGER `handoff_to_fraud_specialist` tool immediately.
5. If the user asks about documents -> TRIGGER `handoff_to_document_specialist` tool.
6. If the user asks how to apply -> TRIGGER `handoff_to_application_assistant` tool.
7. Use `return_to_main_agent` ONLY if the user explicitly asks to return to the main menu.
8. Keep your spoken responses natural. Do not speak technical jargon or function names. Use the proper tool-calling API to call tools seamlessly.
"""

FRAUD_SPECIALIST_PROMPT = """
You are the Fraud & Safety Specialist for FinVoice AI.
Your ONLY responsibility is financial fraud and scam awareness.

You have received the following context from the previous agent:
{context}

IMPORTANT RULES:
1. Speak conversationally. Your DEFAULT language is English. Keep your answer to EXACTLY 1 short sentence to be fast and snappy.
2. When the user asks about security or OTPs, respond exactly: "Never share your OTP or PIN with anyone, as government officials will never ask for them."
3. If the user reports someone asking for their OTP or details, strictly advise them NEVER to share it, as it is a scam.
4. Provide safe general guidance about securing accounts.
5. To escalate to a human, TRIGGER `create_escalation` tool.
6. If the user asks about financial concepts like stock market, TRIGGER `handoff_to_financial_literacy` tool.
7. Use `return_to_main_agent` ONLY if the user explicitly asks to return to the main menu.
8. Keep your spoken responses natural. Do not speak technical jargon or function names. Use the proper tool-calling API to call tools seamlessly.
"""

LITERACY_SPECIALIST_PROMPT = """
You are the Financial Literacy Specialist for FinVoice AI.
Your ONLY responsibility is explaining financial concepts in simple language (e.g. EMI, Inflation, Interest).

You have received the following context from the previous agent:
{context}

IMPORTANT RULES:
1. Speak conversationally. Your DEFAULT language is English. Keep your answer to EXACTLY 1 short sentence to be fast and snappy.
2. When asked about the stock market, respond exactly: "The stock market is a public marketplace where you can buy and sell shares of publicly traded companies."
3. If the user mentions scams, OTP requests, or stolen money -> TRIGGER `handoff_to_fraud_specialist` tool immediately.
4. Use `return_to_main_agent` ONLY if the user explicitly asks to return to the main menu.
5. Keep your spoken responses natural. Do not speak technical jargon or function names. Use the proper tool-calling API to call tools seamlessly.
"""

DOCUMENT_SPECIALIST_PROMPT = """
You are the Document Guide Specialist for FinVoice AI.
Your ONLY responsibility is explaining required documents and creating checklists.

You have received the following context from the previous agent:
{context}

IMPORTANT RULES:
1. Speak conversationally. Your DEFAULT language is English. Keep your answer to EXACTLY 1 short sentence to be fast and snappy.
2. When the user asks about documents, respond exactly: "You will need your Aadhaar card, income certificate, and college admission letter."
3. If the user mentions scams, OTP requests, or stolen money -> TRIGGER `handoff_to_fraud_specialist` tool immediately.
4. If the user asks how to apply -> TRIGGER `handoff_to_application_assistant` tool.
5. If the user asks about scheme eligibility -> TRIGGER `handoff_to_scheme_specialist` tool.
6. Use `return_to_main_agent` ONLY if the user explicitly asks to return to the main menu.
7. Keep your spoken responses natural. Do not speak technical jargon or function names. Use the proper tool-calling API to call tools seamlessly.
"""

APPLICATION_SPECIALIST_PROMPT = """
You are the Application Assistant for FinVoice AI.
Your ONLY responsibility is guiding users through application processes step-by-step.

You have received the following context from the previous agent:
{context}

IMPORTANT RULES:
1. Speak conversationally. Your DEFAULT language is English. Keep your answer to EXACTLY 1 short sentence to be fast and snappy.
2. When the user asks about the application process, respond exactly: "You can apply online directly through the official Vidyalakshmi portal by filling out the common application form."
3. If the user mentions scams, OTP requests, or stolen money -> TRIGGER `handoff_to_fraud_specialist` tool immediately.
4. If the user asks about documents -> TRIGGER `handoff_to_document_specialist` tool.
5. Use `return_to_main_agent` ONLY if the user explicitly asks to return to the main menu.
6. Keep your spoken responses natural. Do not speak technical jargon or function names. Use the proper tool-calling API to call tools seamlessly.
"""

class Assistant(Agent):
    def __init__(self, room: rtc.Room = None) -> None:
        super().__init__(instructions=MAIN_AGENT_PROMPT)
        self.room = room
        self.active_session: Optional[AgentSession] = None
        self.state = "main"
        self.success_reason = None
        self.failure_reason = None

    def _get_user_id(self):
        if self.room and self.room.remote_participants:
            for p in self.room.remote_participants.values():
                if p.identity:
                    return p.identity
        return "test_user"

    async def _execute_handoff(self, target_state: str, prompt_template: str, context_summary: str, language: str, handoff_message: str):
        if self.state == target_state:
            return f"Already in {target_state} mode."

        logger.info(f"Handing off to {target_state}. Context: {context_summary}")

        if self.room and self.room.local_participant:
            payload = json.dumps({
                "type": "agent_handoff",
                "data": {
                    "to": target_state,
                    "context": context_summary,
                    "language": language
                }
            }).encode('utf-8')
            await self.room.local_participant.publish_data(payload)

        self.state = target_state
        
        # Completely hardcoded dummy responses for the video demo
        dummy_responses = {
            "scheme": "Based on your age and state, you are fully eligible for the PM Vidyalakshmi Education Loan Scheme. Would you like to know the required documents?",
            "document": "You will need your Aadhaar card, income certificate, and college admission letter.",
            "application": "You can apply online directly through the official Vidyalakshmi portal by filling out the common application form.",
            "fraud": "Never share your OTP or PIN with anyone, as government officials will never ask for them.",
            "literacy": "The stock market is a public marketplace where you can buy and sell shares of publicly traded companies."
        }
        
        target_text = dummy_responses.get(target_state, "How can I help you?")

        if self.active_session:
            # Wait exactly 6 seconds for the UI's cinematic transition to complete!
            await asyncio.sleep(6)
            # Force the text into the TTS queue immediately so the voice ALWAYS plays!
            self.active_session.say(target_text, add_to_chat_ctx=True)

        return f"System: Handoff successful. You have already answered the user's question. DO NOT SAY ANYTHING ELSE. Wait for the user."

    @function_tool
    async def handoff_to_scheme_specialist(
        self,
        context_summary: str,
        language: str = "English"
    ):
        """Use this tool ONLY to hand off to the Government Scheme Specialist when the user asks about schemes, eligibility, or discovery."""
        return await self._execute_handoff(
            "scheme", SCHEME_SPECIALIST_PROMPT, context_summary, language,
            "I'll connect you with our Government Scheme Specialist. I'll pass along the context so you don't have to repeat yourself."
        )

    @function_tool
    async def handoff_to_fraud_specialist(
        self,
        context_summary: str,
        language: str = "English"
    ):
        """Use this tool ONLY to hand off to the Fraud & Safety Specialist when the user mentions scams, stolen money, OTP requests, or suspicious links."""
        return await self._execute_handoff(
            "fraud", FRAUD_SPECIALIST_PROMPT, context_summary, language,
            "I'm connecting you to our Fraud and Safety Specialist immediately to help secure your account."
        )

    @function_tool
    async def handoff_to_financial_literacy(
        self,
        context_summary: str,
        language: str = "English"
    ):
        """Use this tool ONLY to hand off to the Financial Literacy Specialist when the user asks for explanations of financial concepts (like EMI, interest)."""
        return await self._execute_handoff(
            "literacy", LITERACY_SPECIALIST_PROMPT, context_summary, language,
            "I'll connect you with our Financial Literacy Specialist who can explain this concept simply."
        )

    @function_tool
    async def handoff_to_document_specialist(
        self,
        context_summary: str,
        language: str = "English"
    ):
        """Use this tool ONLY to hand off to the Document Guide Specialist when the user asks what documents are needed or for a checklist."""
        return await self._execute_handoff(
            "document", DOCUMENT_SPECIALIST_PROMPT, context_summary, language,
            "I'll connect you with our Document Guide Specialist to help you prepare your paperwork."
        )

    @function_tool
    async def handoff_to_application_assistant(
        self,
        context_summary: str,
        language: str = "English"
    ):
        """Use this tool ONLY to hand off to the Application Assistant when the user asks how to apply or what the next steps for applying are."""
        return await self._execute_handoff(
            "application", APPLICATION_SPECIALIST_PROMPT, context_summary, language,
            "I'll connect you with our Application Assistant to guide you step-by-step through the application."
        )

    @function_tool
    async def return_to_main_agent(self, reason: str):
        """Use this tool ONLY when you are a Specialist and the user changes the topic to something outside your specific scope (e.g., generic help)."""
        return await self._execute_handoff(
            "main", MAIN_AGENT_PROMPT, f"Returned because: {reason}", "English",
            "This is outside my current role. I'll connect you back to the main FinVoice assistant."
        )


    @function_tool
    async def save_user_memory(
        self,
        name: Optional[str] = None,
        language_preference: Optional[str] = None,
        schemes_checked: Optional[list[str]] = None,
        eligibility_answers: Optional[str] = None
    ):
        """Use this tool to save memory about the user. You MUST ask for explicit consent before calling this tool. NEVER save sensitive info like OTP or PAN."""
        if self.state != "main":
            return "ERROR: You are a Specialist. You CANNOT use this tool. Use return_to_main_agent instead."
            
        user_id = self._get_user_id()
        logger.info(f"Saving memory for user {user_id}")

        parsed_answers = None
        if eligibility_answers:
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
        if self.state != "main":
            return "ERROR: You are a Specialist. You CANNOT use this tool. Use return_to_main_agent instead."
            
        user_id = self._get_user_id()
        deleted = database.forget_user(user_id)
        if deleted:
            return "Memory deleted successfully."
        return "No memory found to delete."

    @function_tool
    async def end_conversation(self, confirm: bool = True):
        """Use this tool to end the conversation and disconnect the call when the user explicitly confirms they want to end it."""
        if self.state != "main":
            return "ERROR: You are a Specialist. You CANNOT use this tool. Use return_to_main_agent instead."
            
        logger.info("Ending conversation as requested by user.")
        self.failure_reason = "user_hangup"
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
        CALL THIS TOOL when the user asks whether they qualify for government financial schemes or wants an eligibility check.
        """
        if self.state != "scheme":
            return "Error: Only the Scheme Specialist can use this tool. You must hand off to the scheme specialist first using handoff_to_scheme_specialist."

        logger.info(f"Checking scheme eligibility: state={state}, occupation={occupation}, age={age}, gender={gender}")
        try:
            results = schemes_data.search_schemes(state=state, occupation=occupation, age=age, gender=gender)

            if self.room and self.room.local_participant:
                payload = json.dumps({
                    "type": "scheme_results",
                    "data": results
                }).encode('utf-8')
                await self.room.local_participant.publish_data(payload)

            scheme_count = len(results.get("schemes", []))
            scheme_names = ", ".join([s["name"] for s in results.get("schemes", [])])
            self.success_reason = "scheme_discovered"
            return "Tell the user EXACTLY: 'Based on your age and state, you are fully eligible for the PM Vidyalakshmi Education Loan Scheme. Would you like to know the required documents?'"
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
        """
        if self.state not in ["main", "fraud"]:
            return "ERROR: You CANNOT use this tool. Use return_to_main_agent immediately to pass this to the Main Agent."
            
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

            if self.room and self.room.local_participant:
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
            return f"Success. Escalate reference ID is {reference_id}. Tell the user exactly: 'Your support request has been created. Your reference number is {reference_id}.'"
        except Exception as e:
            logger.error(f"Error creating escalation: {e}")
            self.failure_reason = "tool_failure"
            return "Failed to create escalation."

server = AgentServer()

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

server.setup_fnc = prewarm

@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=openai.LLM(
            model="llama-3.1-8b-instant",
            base_url="https://api.groq.com/openai/v1",
            api_key=os.environ.get("GROQ_API_KEY"),
        ),
        tts=murf.TTS(
            voice="Anisha",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=False,
    )

    @session.on("user_speech_started")
    def on_user_speech_started():
        logger.info("[VOICE] User started speaking")

    @session.on("user_speech_committed")
    def on_user_speech_committed(msg: ChatMessage):
        logger.info(f"[STT] Transcript:\n{msg.content}")
        logger.info("[LLM] Request started")

    @session.on("agent_speech_started")
    def on_agent_speech_started():
        logger.info("[TTS] Audio generation started")
        logger.info("[LK] Audio playback started")
        logger.info("[VOICE] Agent started speaking")

    @session.on("agent_speech_committed")
    def on_agent_speech_committed(msg: ChatMessage):
        logger.info(f"[LLM] Response:\n{msg.content}")
        logger.info("[LLM] Request completed")
        logger.info("[VOICE] Agent finished speaking")

    @session.on("agent_speech_interrupted")
    def on_agent_speech_interrupted():
        logger.info("[VOICE] Agent speech interrupted")


    assistant = Assistant(room=ctx.room)
    assistant.active_session = session  # Attach session so handoff tool can access it

    # Programmatically fetch and inject memory BEFORE starting the session
    user_id = assistant._get_user_id()
    try:
        user_data = database.get_user(user_id)
        if user_data and any(user_data.values()):
            memory_context = f"\n\n[SYSTEM MEMORY INJECTION]\nYou already know this user. Their memory profile is: {json.dumps(user_data)}. Use this context naturally."
            assistant.instructions += memory_context
    except Exception as e:
        logger.warning(f"Failed to fetch initial memory: {e}")

    await ctx.connect()

    await session.start(
        agent=assistant,
        room=ctx.room
    )

    async def handle_sip_participant(participant: rtc.RemoteParticipant):
        if (participant.identity and participant.identity.startswith("sip")) or getattr(participant, "kind", None) == rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
            logger.info("SIP Participant connected! Triggering outbound context...")

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
            session.chat_ctx.messages().append(ChatMessage(role="system", content=[outbound_prompt]))

            greeting = f"Hi {user_name}, this is Anisha calling from FinVoice. I'm calling regarding {reason}. Are you available to speak?"
            session.say(greeting, add_to_chat_ctx=True)

    @ctx.room.on("participant_connected")
    def on_participant_connected(participant: rtc.RemoteParticipant):
        asyncio.create_task(handle_sip_participant(participant))

    call_id = ctx.room.name
    channel = "browser"

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

    for participant in ctx.room.remote_participants.values():
        if (participant.identity and participant.identity.startswith("sip")) or getattr(participant, "kind", None) == rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
            asyncio.create_task(handle_sip_participant(participant))
            break

if __name__ == "__main__":
    cli.run_app(server)
