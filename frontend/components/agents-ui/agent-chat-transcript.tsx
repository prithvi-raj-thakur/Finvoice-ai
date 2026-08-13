You are now the lead product engineer and innovation architect for my project:

FINVOICE AI — Voice - first Financial Access for Bharat.

  IMPORTANT:

Do NOT redesign the landing page.

Do NOT focus on visual polish.

Do NOT replace the existing UI.

Your job is to improve the ACTUAL PRODUCT FEATURES and make FinVoice substantially more innovative than a standard voice - agent submission.

The goal is to turn the existing project into something that could realistically compete for TOP 2 in the Voice for Bharat challenge.

============================================================
CURRENT CAPABILITIES
============================================================

The project already has:

1. Voice conversation
2. Murf Falcon TTS
3. Anisha voice
4. Groq LLM
5. Deepgram STT
6. Multilingual / code-mixed conversation
7. LiveKit
8. SQLite memory
9. Consent-based memory
10. Real-data/tool calls
11. Financial scheme assistance
12. Outbound calling
13. Human escalation
14. Call analytics
15. iPhone-style voice interface
16. Live transcript/chat
17. Agent states
18. Microphone error handling

DO NOT BREAK ANY OF THESE.

First inspect the entire existing codebase and understand how these features currently work.

Then improve the PRODUCT around them.

============================================================
THE BIG IDEA
============================================================

Do NOT position FinVoice as:

"An AI that answers financial questions."

That is too ordinary.

Position it as:

"An intelligent financial access companion that understands what a person needs, finds relevant opportunities, explains them in their language, remembers useful context with consent, takes the next action, and knows when to involve a human."

The key innovation is:

QUESTION
→ UNDERSTAND
→ DISCOVER
→ CHECK
→ EXPLAIN
→ REMEMBER
→ ACT
→ FOLLOW UP
→ ESCALATE WHEN NEEDED

The agent should not merely answer.

It should help the user MOVE FORWARD.

============================================================
FEATURE 1 — FINANCIAL INTENT ENGINE
============================================================

Build an intent-detection layer.

When the user says something vague like:

"Government se koi paisa mil sakta hai?"

The agent should understand that the user may be looking for:

- government scheme discovery
- financial assistance
- eligibility
- subsidy
- loan
- scholarship
- pension
- insurance
- benefit

Instead of immediately asking a generic:

"How can I help you?"

The agent should intelligently narrow down the intent.

Example:

User:

"Mujhe government se koi financial help mil sakti hai?"

FinVoice:

"Bilkul. Main aapke liye relevant schemes dekh sakta hoon. Aap student hain, farmer hain, job karte hain, ya business chalate hain?"

The system should progressively collect only the information necessary.

Do not interrogate the user with a huge form.

============================================================
FEATURE 2 — CONVERSATIONAL ELIGIBILITY ENGINE
============================================================

This should become one of the main differentiators.

Do not make eligibility checking feel like filling out a form.

Turn it into a conversation.

Example:

FinVoice:

"Aapki age kis range mein hai?"

User:

"22."

FinVoice:

"Okay. Kya aap currently student hain?"

User:

"Yes."

FinVoice:

"Got it. Kya aapke family ki annual income roughly 3 lakh se kam hai?"

Then the system evaluates eligibility.

At the end:

ELIGIBILITY RESULT

✓ Likely eligible
⚠ Needs verification
✕ Not eligible based on current information

IMPORTANT:

Never claim guaranteed government approval.

Clearly distinguish:

"Based on the information you provided"

from:

"Official approval."

============================================================
FEATURE 3 — SCHEME MATCHING
============================================================

Instead of searching one scheme at a time, build:

"Scheme Match"

The user provides their situation.

The system returns the most relevant schemes.

Example:

User:

"I am a 21-year-old student from West Bengal."

FinVoice should reason through the available dataset/tools and identify potentially relevant opportunities.

Display:

BEST MATCH

Scheme name

Why it may fit

Eligibility

Documents

Next step

Confidence / verification status

Do NOT invent schemes.

If real government data is unavailable, clearly label the source as a local/demo dataset.

============================================================
FEATURE 4 — "WHY THIS SCHEME?"
============================================================

Do not simply say:

"You are eligible."

Explain why.

Example:

"Based on what you told me, this appears relevant because you're a student and your reported income falls within the scheme's threshold."

This builds trust.

============================================================
FEATURE 5 — DOCUMENT CHECKLIST
============================================================

After identifying a relevant scheme:

Automatically create:

YOUR DOCUMENT CHECKLIST

✓ Aadhaar
✓ Income certificate
✓ Student certificate
✓ Bank details

But only list documents supported by the actual scheme data.

Then allow the user to ask:

"What am I missing?"

FinVoice should answer from the stored checklist.

============================================================
FEATURE 6 — "WHAT SHOULD I DO NEXT?"
============================================================

This is a major differentiator.

Every financial conversation should ideally end with:

NEXT BEST ACTION

For example:

1. Verify eligibility
2. Collect income certificate
3. Visit official portal
4. Submit application
5. Contact support if needed

The AI should not stop at explanation.

It should provide an actionable next step.

============================================================
FEATURE 7 — PERSONAL FINANCIAL PROFILE
============================================================

Build a consent-based profile.

Example:

FINVOICE PROFILE

Name
Preferred language
User category
Location
Relevant preferences
Previously explored schemes

IMPORTANT:

Never store:

OTP
PIN
password
bank account number
card number
sensitive authentication credentials

Memory must remain consent-based.

Add:

"Forget my information"

functionality if feasible.

============================================================
FEATURE 8 — PROACTIVE FINANCIAL COMPANION
============================================================

Use the Day 6 outbound calling capability more intelligently.

Instead of making arbitrary outbound calls, connect them to actual user events.

Example:

User previously explored a scheme.

The system remembers it.

Later:

"Your application deadline is approaching."

FinVoice can initiate a reminder.

The outbound call should explain:

who is calling
why
what action may be useful
how to opt out

Do not spam.

Implement a clear consent / notification preference.

============================================================
FEATURE 9 — FOLLOW-UP MEMORY
============================================================

This is where the agent becomes much more than a chatbot.

Conversation 1:

User asks about a scheme.

Conversation 2:

FinVoice says:

"Last time we discussed the student support scheme. Would you like to continue from there?"

Then:

"What happened with your income certificate?"

The agent should maintain continuity.

============================================================
FEATURE 10 — HUMAN ESCALATION WITH CONTEXT
============================================================

When escalation is needed, don't simply say:

"Contact support."

Create an actual escalation package.

Example:

ESCALATION REQUEST

Reference:
FV-2026-1048

User:
Ramesh

Issue:
Unable to complete scheme eligibility verification.

Agent checked:
Eligibility information
Required documents

Reason for escalation:
Official verification required.

Urgency:
Medium

Preferred language:
Hindi

The human should NOT need to read the entire conversation.

============================================================
FEATURE 11 — HUMAN-IN-THE-LOOP FEEDBACK
============================================================

Add a way for the human/support person to resolve an escalation.

Possible states:

OPEN
IN REVIEW
RESOLVED

Then FinVoice can communicate the status back to the user.

Example:

"Your request FV-2026-1048 is currently under review."

This creates a complete loop:

USER
→ AI
→ HUMAN
→ AI
→ USER

============================================================
FEATURE 12 — SOURCE TRANSPARENCY
============================================================

Whenever the agent uses external financial data, expose:

Source
Data date
Last updated
Verification status

For example:

SOURCE
Government dataset

DATA UPDATED
13 Aug 2026

STATUS
Information retrieved successfully

Never pretend that old data is current.

If the source fails:

"I couldn't verify the latest information right now, so I don't want to guess."

This is extremely important for financial trust.

============================================================
FEATURE 13 — "I DON'T KNOW" MODE
============================================================

Implement an explicit uncertainty layer.

If confidence is low:

DO NOT hallucinate.

Instead:

"I don't have enough verified information to answer that confidently."

Then offer:

- clarify the question
- check available data
- create human-help request

This should be treated as a FEATURE, not a failure.

============================================================
FEATURE 14 — FRAUD / SCAM AWARENESS
============================================================

Add a financial safety capability.

If the user says:

"Someone called saying I need to give OTP to get the scheme."

FinVoice should immediately recognize this as a potential scam scenario.

It should warn:

"Do not share your OTP, PIN or password."

Then explain what the user should do.

IMPORTANT:

Do not claim that every situation is definitely fraud.

Use language such as:

"This may be a scam. Please do not share your OTP."

============================================================
FEATURE 15 — SCAM MESSAGE ANALYSIS
============================================================

If feasible, allow the user to describe a suspicious message/call.

Example:

"Someone sent me a message saying I won ₹50,000."

FinVoice can analyze the described message for common warning signs:

- urgency
- OTP request
- payment request
- suspicious links
- impersonation
- guaranteed returns

Then provide:

RISK INDICATORS

and

SAFE NEXT STEPS.

============================================================
FEATURE 16 — FINANCIAL LANGUAGE TRANSLATOR
============================================================

Create a special mode where FinVoice converts complicated financial terminology into simple language.

Example:

User:

"What is an interest subsidy?"

FinVoice:

"Simple words mein, iska matlab hai..."

The user should be able to say:

"Explain like I'm new to finance."

Then the agent changes its explanation style.

============================================================
FEATURE 17 — CODE-MIXED UNDERSTANDING
============================================================

Make multilingual understanding a first-class capability.

Support conversations like:

"Mujhe ye scheme ka eligibility criteria samajhna hai."

"Can you tell me iska benefit kitna hai?"

"আমার documents কি কি লাগবে?"

The agent should preserve the user's natural language style.

Do NOT force users into formal English.

============================================================
FEATURE 18 — CONVERSATION MODES
============================================================

Introduce intelligent modes:

DISCOVER

Find relevant schemes.

CHECK

Check eligibility.

EXPLAIN

Explain financial concepts.

APPLY

Guide through the next steps.

FOLLOW UP

Continue a previous financial journey.

HUMAN HELP

Escalate to support.

The user should NOT need to manually select these modes.

The agent should infer them from intent.

============================================================
FEATURE 19 — FINANCIAL JOURNEY
============================================================

Instead of treating every conversation independently, maintain a journey.

Example:

DISCOVERED SCHEME
↓
CHECKED ELIGIBILITY
↓
DOCUMENTS IDENTIFIED
↓
APPLICATION GUIDANCE
↓
FOLLOW-UP
↓
COMPLETED / ESCALATED

Show this journey in the existing UI where appropriate.

Do not redesign the entire frontend.

Add the minimum UI required to communicate progress.

============================================================
FEATURE 20 — SMART CALL OUTCOMES
============================================================

Improve the Day 8 analytics.

Instead of:

Successful
Failed

Track meaningful outcomes:

SCHEME DISCOVERED
ELIGIBILITY CHECKED
DOCUMENT LIST PROVIDED
ACTION COMPLETED
HUMAN ESCALATED
USER ABANDONED
TOOL FAILURE
UNVERIFIED ANSWER

This creates much more meaningful analytics.

============================================================
FEATURE 21 — "FINVOICE SCORE"
============================================================

If useful, introduce a simple internal journey score.

Example:

FINANCIAL JOURNEY

████████░░ 80%

The score should represent task completion, NOT creditworthiness.

IMPORTANT:

Never create a "financial health score" that could be interpreted as a credit score unless there is a legitimate methodology.

Instead call it:

"Journey completion"

or:

"Task progress."

============================================================
FEATURE 22 — ACCESSIBILITY MODE
============================================================

Create a voice-first accessibility mode.

The user can say:

"Slow down."

FinVoice slows its speaking pace.

User:

"Repeat that."

FinVoice repeats the last important answer.

User:

"Short answer."

FinVoice becomes concise.

User:

"Explain simply."

FinVoice simplifies the explanation.

This is extremely useful for voice UX.

============================================================
FEATURE 23 — INTERRUPTION HANDLING
============================================================

Make the voice experience natural.

If the user interrupts:

FinVoice should stop speaking and listen.

If the user says:

"Wait."

Pause.

If:

"Actually, I meant..."

Update the intent instead of continuing the previous response.

============================================================
FEATURE 24 — SMART SILENCE HANDLING
============================================================

If the user becomes silent:

First:

"Are you still there?"

After another silence:

"No problem. We can continue whenever you're ready."

Do not immediately terminate.

============================================================
FEATURE 25 — USER-CONTROLLED PRIVACY
============================================================

Add voice commands:

"Don't remember this."

"Forget what I told you."

"What do you remember about me?"

"Stop remembering me."

The agent should execute the appropriate function.

This would be a strong demonstration of responsible AI.

============================================================
FEATURE 26 — DEMO MODE
============================================================

Create a controlled demo mode for judges.

A judge should be able to experience the strongest capabilities quickly.

Possible demo flow:

1. User speaks in Hindi.
2. Agent identifies financial intent.
3. Agent asks only necessary questions.
4. Scheme is matched.
5. Eligibility is checked.
6. Documents are generated.
7. Source is shown.
8. User asks "remember this."
9. Memory is saved with consent.
10. User returns later.
11. Agent recognizes the user.
12. A tool retrieves updated information.
13. User asks a sensitive/out-of-scope question.
14. Agent refuses safely.
15. Human escalation is created.
16. Reference ID is generated.
17. Analytics records the outcome.

Make this flow reliable.

============================================================
FEATURE 27 — FAILURE-FIRST ENGINEERING
============================================================

Every external dependency needs a failure path.

If:

API unavailable
→ explain clearly.

Database unavailable
→ do not pretend memory exists.

Tool timeout
→ say information couldn't be verified.

Human escalation fails
→ tell the user the request could not be created.

Outbound call fails
→ record the outcome.

Never silently fail.

Never hallucinate success.

============================================================
FEATURE 28 — PRIVACY FILTER
============================================================

Before storing or sending data, filter:

OTP
PIN
password
bank account number
card number
CVV
authentication credentials

Never put these into:

memory
analytics
escalation summaries
logs
dashboard

============================================================
FEATURE 29 — PRODUCT INTELLIGENCE LAYER
============================================================

Create a central decision layer that determines:

USER INTENT
LANGUAGE
REQUIRED INFORMATION
RELEVANT TOOL
MEMORY NEEDED?
CONSENT REQUIRED?
ESCALATION REQUIRED?
NEXT BEST ACTION

This should prevent the agent from behaving like a generic LLM.

============================================================
FEATURE 30 — DO NOT OVERBUILD
============================================================

Do NOT implement every feature blindly.

First inspect the current codebase.

Identify:

what already exists
what is partially implemented
what is missing
what can be improved safely

Then prioritize features according to:

1. User value
2. Innovation
3. Reliability
4. Demo impact
5. Safety
6. Implementation effort

============================================================
TOP-2 PRIORITY
============================================================

If you have limited time, prioritize these five:

PRIORITY 1
Conversational scheme discovery + eligibility engine

PRIORITY 2
Financial journey / next-best-action system

PRIORITY 3
Consent-based memory + follow-up

PRIORITY 4
Human escalation with context and status

PRIORITY 5
Source transparency + uncertainty / anti-hallucination layer

These should feel like ONE integrated product rather than separate features.

============================================================
THE FINAL PRODUCT EXPERIENCE
============================================================

The ideal FinVoice interaction should look like:

USER:

"Mujhe government se koi financial help mil sakti hai?"

FINVOICE:

"Bilkul. Main aapke liye relevant schemes check kar sakta hoon. Aap student hain, farmer hain, ya business karte hain?"

USER:

"Student."

FINVOICE:

"Okay. Aapki age kitni hai?"

USER:

"22."

FINVOICE:

"Thanks. Aapke answers ke basis par mujhe do potentially relevant schemes mil rahi hain."

[SCHEME MATCH]

FINVOICE:

"Main eligibility check kar sakta hoon. Iske liye mujhe aapki annual family income ka approximate range chahiye."

USER:

"3 lakh se kam."

FINVOICE:

"Based on the information you've shared, you appear to meet the initial criteria. Official approval, however, will depend on verification."

[ELIGIBILITY]

FINVOICE:

"Aapke next step ke liye income certificate aur student proof useful rahenge."

[DOCUMENT CHECKLIST]

FINVOICE:

"Would you like me to remember that you're currently exploring student schemes?"

USER:

"Yes."

[MEMORY SAVED]

LATER:

FINVOICE:

"Welcome back. Last time we were checking student financial schemes. Would you like to continue?"

THIS is the experience we want.

Not:

USER → QUESTION → GENERIC AI ANSWER.

============================================================
FINAL IMPLEMENTATION RULE
============================================================

Do not destroy existing functionality.

Do not rewrite working systems unnecessarily.

Do not add fake features.

Do not hardcode fake government information and present it as live.

Do not claim eligibility as guaranteed.

Do not store sensitive financial credentials.

Do not hallucinate.

Build reliable, demonstrable features.

At the end, test every new capability.

For every feature, provide:

- implementation
- error handling
- voice behavior
- UI behavior if needed
- demo/test case

The final product should feel like:

NOT AN AI CHATBOT.

A FINANCIAL ACCESS COMPANION.

The competition is not going to be won by having the most features.

It will be won by having the most coherent, useful and trustworthy product.

Make FinVoice feel like that.'use client';

import { type ComponentProps } from 'react';
import { AnimatePresence } from 'motion/react';
import { type AgentState, type ReceivedMessage } from '@livekit/components-react';
import { AgentChatIndicator } from '@/components/agents-ui/agent-chat-indicator';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';

/**
 * Props for the AgentChatTranscript component.
 */
export interface AgentChatTranscriptProps extends ComponentProps<'div'> {
  /**
   * The current state of the agent. When 'thinking', displays a loading indicator.
   */
  agentState?: AgentState;
  /**
   * Array of messages to display in the transcript.
   * @defaultValue []
   */
  messages?: ReceivedMessage[];
  /**
   * Additional CSS class names to apply to the conversation container.
   */
  className?: string;
}

/**
 * A chat transcript component that displays a conversation between the user and agent.
 * Shows messages with timestamps and origin indicators, plus a thinking indicator
 * when the agent is processing.
 *
 * @extends ComponentProps<'div'>
 *
 * @example
 * ```tsx
 * <AgentChatTranscript
 *   agentState={agentState}
 *   messages={chatMessages}
 * />
 * ```
 */
export function AgentChatTranscript({
  agentState,
  messages = [],
  className,
  ...props
}: AgentChatTranscriptProps) {
  return (
    <Conversation className={className} {...props}>
      <ConversationContent>
        {messages.map((receivedMessage) => {
          const { id, timestamp, from, message } = receivedMessage;
          const locale = navigator?.language ?? 'en-US';
          const messageOrigin = from?.isLocal ? 'user' : 'assistant';
          const time = new Date(timestamp);
          const title = time.toLocaleTimeString(locale, { timeStyle: 'full' });

          // Strip raw tool calls that might leak from the LLM (e.g., Llama 3 <function=...>)
          const cleanMessage = message.replace(/<function=[\s\S]*?(?:<\/function>|$)/gi, '').trim();
          if (!cleanMessage) return null;

          return (
            <Message key={id} title={title} from={messageOrigin}>
              <MessageContent>
                <MessageResponse>{cleanMessage}</MessageResponse>
              </MessageContent>
            </Message>
          );
        })}
        <AnimatePresence>
          {agentState === 'thinking' && <AgentChatIndicator size="sm" />}
        </AnimatePresence>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
