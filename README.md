# Voice Agent Starter — Powered by Murf Falcon

Build a production voice AI agent in 5 minutes. Powered by the fastest TTS on the market - swap the system prompt to build anything from customer support to language tutors.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Murf Falcon](https://img.shields.io/badge/TTS-Murf%20Falcon-6366F1)](https://murf.ai/api/docs/text-to-speech/streaming) [![LiveKit](https://img.shields.io/badge/Transport-LiveKit-002cf2)](https://docs.livekit.io) [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)

---

## Why Murf Falcon

- **55ms model latency** - fastest production TTS
- **130ms time-to-first-audio** across 10+ global regions
- **$0.01/1000 characters** - up to 10x cheaper than alternatives
- **150+ voices** across 35+ languages
- **99.38% pronunciation accuracy**

---

## Architecture

```mermaid
flowchart LR
    A[🎙️ User speaks] -->|audio| B[Deepgram STT]
    B -->|text| C[LLM]
    C -->|response text| D[Murf Falcon TTS]
    D -->|audio| E[LiveKit]
    E -->|stream| F[🔊 User hears]

    style A fill:#444441,stroke:#888780,color:#fff
    style B fill:#185FA5,stroke:#85B7EB,color:#fff
    style C fill:#534AB7,stroke:#AFA9EC,color:#fff
    style D fill:#0F6E56,stroke:#5DCAA5,color:#fff
    style E fill:#D85A30,stroke:#F0997B,color:#fff
    style F fill:#444441,stroke:#888780,color:#fff
```

---

## Quickstart

### Prerequisites

- **Python** 3.10+
- **[uv](https://docs.astral.sh/uv/)** - fast Python package manager
  ```bash
  # macOS/Linux
  curl -LsSf https://astral.sh/uv/install.sh | sh
  # Windows (PowerShell)
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
- **Node.js** 18+
- **pnpm** — fast Node package manager
  ```bash
  npm install -g pnpm
  ```
- A [LiveKit](https://cloud.livekit.io/) project (free tier available)

### Step 1: Clone the repo

```bash
git clone https://github.com/murf-ai/murf-livekit-starter.git
cd murf-livekit-starter
```

### Step 2: Set up environment variables

Create `.env.local` in both `backend/` and `frontend/` (copy from `.env.example` in each). You need:

| Variable | Where to get it | Required |
|----------|-----------------|----------|
| `LIVEKIT_URL` | LiveKit Cloud dashboard | Yes |
| `LIVEKIT_API_KEY` | LiveKit Cloud dashboard | Yes |
| `LIVEKIT_API_SECRET` | LiveKit Cloud dashboard | Yes |
| `MURF_API_KEY` | [murf.ai/api/dashboard](https://murf.ai/api/dashboard) | Yes |
| `DEEPGRAM_API_KEY` | [deepgram.com](https://deepgram.com) | Yes |
| `GOOGLE_API_KEY` (or `OPENAI_API_KEY`) | Depends on LLM choice | Yes |

### Step 3: Install backend dependencies

```bash
cd backend
uv sync
uv run python src/agent.py download-files
```

### Step 4: Install frontend dependencies

```bash
cd frontend
pnpm install
```

### Step 5: Run it

**Option A - All-in-one (from repo root):**

```bash
# macOS/Linux
chmod +x start_app.sh
./start_app.sh

# Windows (PowerShell)
.\start_app.ps1
```

**Option B - Separate terminals:**

```bash
# Terminal 1 — LiveKit Server
livekit-server --dev

# Terminal 2 — Backend agent
cd backend && uv run python src/agent.py dev

# Terminal 3 — Frontend
cd frontend && pnpm dev
```

Then open **http://localhost:3000** in your browser.

You should now see the voice agent UI. Click **Start talking**, allow microphone access, and speak — the agent will respond with Murf Falcon TTS. Ensure your backend and (if using Option B) LiveKit server are running.

---

## Day 5 — Tools

**Tool:** `check_scheme_eligibility`
**Purpose:** Government financial scheme eligibility lookup.
**Data Source:** LOCAL DATASET (Curated real government schemes to ensure reliability without requiring external API registration/auth).

### Documentation

- **Tool Input:** Accepts structured JSON containing parameters like `state`, `occupation`, `age`, and `gender`. Uses existing user memory when possible.
- **Tool Output:** Returns a structured list of potentially matching schemes (e.g., PM-KISAN, Sukanya Samriddhi Yojana, Atal Pension Yojana). Includes scheme name, relevance reason, benefits, required documents, source, and last updated date.
- **Data Freshness:** Every result includes a `last_updated` date for the specific scheme data, and a `checked_at` timestamp indicating when the search was performed.
- **Failure Behavior:** If no matches are found, gracefully informs the user. If the service errors, returns a safe error indicating temporary unavailability without hallucinating.
- **Safety Limitations:** Never requests sensitive financial credentials (OTP, PIN, passwords, Aadhaar, PAN) for checking schemes. Never promises approval, adding a disclaimer that final decisions are made by government authorities.

---

## Day 6 — Outbound Voice Calls

**Feature:** Proactive Outbound Calling
**Use Case:** Financial Services often need to follow up with users regarding upcoming deadlines, application status updates, or new government schemes matching their profile. Waiting for the user to initiate contact is often insufficient.

### Architecture
- **Twilio Integration:** Uses the Twilio Python SDK to initiate an outbound call.
- **LiveKit SIP Ingress:** Twilio's webhook connects the answered call directly to the LiveKit project via `TwiML` `<Dial><Sip>`.
- **LiveKit Agent Dispatch:** The Python backend dynamically dispatches the voice agent into the SIP room and injects the context (e.g. user details and reason for the call) into the LLM system prompt.
- **Service:** A new dedicated FastAPI service (`backend/src/outbound_call_service.py`) handles the Twilio webhook lifecycle.

### Environment Variables
Ensure these are set in `backend/.env.local`:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `PUBLIC_BASE_URL` (Your ngrok/public URL for Twilio to reach your local FastAPI server)
- `LIVEKIT_SIP_DOMAIN` (Your LiveKit Cloud SIP domain, e.g. `your-project.sip.livekit.cloud`)

### Webhook & Twilio Configuration Requirements
For outbound calling to work:
1. You must have a verified Twilio number capable of making outbound calls.
2. For local testing, you must expose port 8000 using a secure tunnel (e.g., ngrok `ngrok http 8000`) and set `PUBLIC_BASE_URL` to your ngrok URL.
3. You must configure **SIP Ingress** in LiveKit Cloud so that Twilio can reach LiveKit using `<Dial><Sip>`.

### User Consent & Opt-Out Behavior
- **Explicit Identity:** FinVoice immediately identifies itself as an automated service and explains the reason for the call.
- **Opt-Out (Stop):** The user is instructed that they can say "stop" at any time. If the user expresses a desire to stop receiving calls, the LLM calls the `opt_out_outbound_calls` tool. This tool ends the call and marks `outbound_opt_out = true` in the SQLite memory database. Future outbound calls to this user are blocked at the API level.

### Retry Policy & Call Statuses
- Call states (`initiated`, `ringing`, `answered`, `connected`, `completed`, `no_answer`, `busy`, `failed`, `opted_out`) are tracked in SQLite via Twilio status callbacks.
- **Retry Strategy:** The system currently initiates one call at a time. If the call status is `no_answer` or `busy`, manual or cron-based retries can be configured (maximum 1 retry after delay). If the call is an immediate hang-up or opted-out, it is never retried.

### Sensitive Data Policy
- The system is instructed **never** to ask for OTP, PIN, CVV, passwords, Aadhaar, PAN, or any banking credentials over the phone.
- If the user volunteers sensitive information, the AI politely interrupts and refuses to process or store the data.

### How to Test
1. Set up your environment variables as described above.
2. Start the backend and frontend (`.\start_app.ps1` or `./start_app.sh`). Ensure your ngrok tunnel is pointing to `http://localhost:8000`.
3. Open the UI. On the main page, find the **Outbound Calls** section.
4. Enter a phone number you control in E.164 format (e.g. `+919876543210`).
5. Select a reminder scenario and click **Call Now**.
6. Answer your phone. The agent will greet you and explain the context. Test the opt-out by saying "Stop calling me".

**IMPORTANT**: Demo calls are made only to numbers controlled by the tester or used with permission. Unsolicited bulk dialing is strictly prohibited.

---

## Day 7 — Human Escalation

**Feature:** Human Support Escalation
**Use Case:** FinVoice is not responsible for solving every financial problem. There are scenarios where a human must take over. This implementation handles these hand-offs securely and reliably.

### Escalation Scenarios
FinVoice will escalate in two primary cases:
1. **Possible fraud:** Suspicious activity, unfamiliar transactions, or stolen account details. FinVoice will NOT ask for passwords or investigate private banking systems.
2. **Decision outside agent authority:** If the user asks for a definitive loan approval or guarantee that the AI is not authorized to give.

### How it Works
- **`create_escalation()` Tool:** The LLM can call this backend function when it determines human assistance is needed.
- **Consent Requirement:** The agent MUST explicitly ask the user for permission (e.g. "Would you like me to send a summary to a human support agent?") BEFORE calling the tool. If the user says no, the agent respects their decision.
- **Escalation Summary:** A structured, privacy-safe summary is generated, including `reason`, `urgency`, `what_happened`, `what_agent_checked`, `language`, and `preferred_follow_up`.
- **Reference IDs:** The system generates a unique Reference ID (e.g. `ESC-2026-1042`), which the agent reads to the user.
- **Duplicate Prevention:** If the same user has an open escalation for the same issue, the system gracefully returns the existing Reference ID instead of creating a duplicate.
- **Privacy Protections:** Strict LLM prompt guardrails ensure the agent NEVER requests or logs OTP, PIN, CVV, passwords, Aadhaar, PAN, or other banking credentials.
- **Support Dashboard:** A polished Next.js frontend route (`/support`) provides a visual Support Center for human agents. It fetches open requests directly from the local SQLite database. Human agents can view issue summaries and transition the `urgency` levels (High/Medium/Low) or `status` (OPEN/IN_PROGRESS/RESOLVED).

---

## Deploy

Want to deploy this beyond localhost? You'll need to deploy **two services**: the backend agent and the frontend. Both must use the same LiveKit project.

> This is a two-service app — the backend agent and the frontend UI deploy separately. You'll need both running and connected to the same LiveKit project.

### Backend (Python agent) — Deploy to Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/tIVCF1?referralCode=cNjn2P&utm_medium=integration&utm_source=template&utm_campaign=generic)

Set these environment variables in Railway:

- `MURF_API_KEY`
- `DEEPGRAM_API_KEY`
- `GOOGLE_API_KEY` or `OPENAI_API_KEY`
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

The backend runs as a long-lived Python process that connects to LiveKit as an agent. Railway handles this well.

### Frontend (Next.js) — Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/murf-ai/murf-livekit-starter&root-directory=frontend&env=LIVEKIT_URL,LIVEKIT_API_KEY,LIVEKIT_API_SECRET&project-name=murf-voice-agent&repository-name=murf-voice-agent)

Set these environment variables in Vercel:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `AGENT_NAME` (optional — for explicit agent dispatch)

The frontend is a standard Next.js app. Point it at the same LiveKit instance your backend agent is connected to.

### Connecting them

The frontend and backend don't call each other directly — they both connect to **LiveKit**, which handles the real-time audio transport.

1. Use the **same** `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` on both Railway and Vercel
2. Set `AGENT_NAME=my-agent` on Vercel — this matches the `agent_name="my-agent"` registered in `backend/src/agent.py`
3. Verify: Railway logs should show the agent connected to LiveKit. Open your Vercel URL, click **Start talking** — the agent should respond

If the agent doesn't connect, double-check that both services point to the same LiveKit project and that the backend is running (check Railway logs).

---

## Change the Use Case

The default system prompt makes this a **customer support agent**. You can change the agent’s behavior by editing the prompt.

**Where the prompt lives:** `backend/src/agent.py`- the `SYSTEM_PROMPT` constant (near the top of the file, after the imports). Change that string to change what your voice agent does.

### Example prompts (copy-paste)

**Customer Support (default):**

```
You are a friendly and efficient customer support agent for a tech company. Help users with account issues, billing questions, and product troubleshooting. Be concise, empathetic, and solution-oriented. If you don't know something, say so honestly and offer to escalate.
```

**Language Tutor:**

```
You are a patient and encouraging language tutor helping the user practice conversational Spanish. Speak primarily in Spanish but switch to English to explain grammar or vocabulary when needed. Correct mistakes gently and suggest better phrasing. Keep conversations natural and fun.
```

**AI Receptionist:**

```
You are a professional receptionist for a medical clinic. Help callers schedule appointments, answer questions about office hours and services, and take messages for doctors. Be warm but efficient. Ask for the caller's name and reason for calling upfront.
```

See the Configuration section below for voice, STT, and LLM options.

---

## Configuration

### Murf voice

Edit the `tts=murf.TTS(...)` call in `backend/src/agent.py`. Set the `voice` argument to any Murf voice ID. Examples:

- `en-US-natalie` — US English (female)
- `en-UK-ruby` — UK English (female)
- `en-US-miles` — US English (male)
- `en-US-matthew` — US English (male, default in this starter)

Browse all voices: [Murf Voice Library](https://murf.ai/api/docs/voices-styles/voice-library).

### STT provider

STT is configured in `backend/src/agent.py` in the `AgentSession(stt=...)` call. The default is Deepgram (`deepgram.STT(model="nova-3")`). You can swap to another LiveKit-compatible STT plugin if needed.

### LLM (Gemini vs OpenAI)

- **Gemini (default):** Set `GOOGLE_API_KEY` and use `llm=google.LLM(model="gemini-2.5-flash")` in `agent.py`.
- **OpenAI:** Set `OPENAI_API_KEY`, add the OpenAI plugin, and use the corresponding `llm=openai.LLM(...)` in `agent.py`.

### Audio format

Murf Falcon and LiveKit handle audio format internally. For advanced options, see [Murf API docs](https://murf.ai/api/docs) and [LiveKit docs](https://docs.livekit.io).

---

## Project Structure

```
murf-livekit-starter/
├── backend/                 # Python voice agent (LiveKit Agents + Murf Falcon)
│   ├── src/
│   │   └── agent.py         # Agent entrypoint, pipeline (STT/LLM/TTS), system prompt
│   ├── tests/               # Agent tests
│   ├── .env.example         # Backend env template
│   ├── pyproject.toml       # Python deps (uv)
│   └── railway.toml         # Railway deploy config
├── frontend/                # Next.js UI for voice sessions
│   ├── app/
│   │   ├── page.tsx         # Main page
│   │   └── api/token/       # LiveKit token endpoint (dev)
│   ├── components/          # UI (agents-ui, app config, theme)
│   ├── app-config.ts        # Branding, title, button text, accent
│   ├── .env.example         # Frontend env template
│   └── package.json         # Node deps (pnpm)
├── start_app.sh             # Start LiveKit + backend + frontend (macOS/Linux)
├── start_app.ps1            # Start LiveKit + backend + frontend (Windows)
├── README.md                # This file
```

For deeper documentation on each part, see:

- [Backend Documentation](./backend/README.md) — agent pipeline, voice/LLM/STT configuration, testing, deployment
- [Frontend Documentation](./frontend/README.md) — UI customization, visualizers, theming, component architecture

---

## Links

- [Murf API Docs](https://murf.ai/api/docs)
- [Murf Voice Library](https://murf.ai/api/docs/voices-styles/voice-library)
- [LiveKit Docs](https://docs.livekit.io)
- [Deepgram Docs](https://developers.deepgram.com)
- [Murf Falcon Benchmarks](https://murf.ai/falcon/benchmarks)
- [TTS Latency Benchmarker](https://github.com/sahilsgupta/tts-latency-benchmarker) — run your own p50/p95 tests across providers
- [Murf Discord](https://discord.gg/FbKAy96Sz7)
- [Murf Startup Incubator](https://murf.ai/api) — 50M free characters for startups

---

## License

MIT
