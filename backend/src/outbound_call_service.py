import logging
import os
import uuid
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from twilio.rest import Client

import database

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
load_dotenv(env_path, override=True)

logger = logging.getLogger("outbound_service")
logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OutboundCallRequest(BaseModel):
    phone_number: str
    user_id: Optional[str] = None
    reason: Optional[str] = "follow_up"
    scheme_id: Optional[str] = None
    room_name: Optional[str] = None

@app.post("/api/outbound-call")
async def initiate_outbound_call(req: OutboundCallRequest):
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    twilio_number = os.environ.get("TWILIO_PHONE_NUMBER")
    base_url = os.environ.get("PUBLIC_BASE_URL")

    if req.user_id:
        user_data = database.get_user(req.user_id)
        if user_data and user_data.get("outbound_opt_out"):
            return {"success": False, "error": "User has opted out of outbound calls"}

    call_id = f"call_{uuid.uuid4().hex[:8]}"

    # Save call context to DB
    database.create_outbound_call(
        call_id=call_id,
        user_id=req.user_id or "test_user",
        phone_number=req.phone_number,
        reason=req.reason,
        scheme_id=req.scheme_id
    )

    room_name = req.room_name or f"outbound-{call_id}"
    webhook_url = f"{base_url}/api/twilio/webhook?call_id={call_id}&room_name={room_name}" if base_url else ""
    status_callback = f"{base_url}/api/twilio/status?call_id={call_id}" if base_url else ""

    # SIMULATION MODE: If Twilio is not configured, simulate the call connecting
    if not all([account_sid, auth_token, twilio_number, base_url]):
        logger.warning(f"Twilio/Ngrok config missing. Simulating outbound call {call_id} instead of dialing real phone.")

        import asyncio
        async def simulate_call():
            # Simulate ringing
            database.update_outbound_call_status(call_id, "ringing")
            await asyncio.sleep(3)
            # Simulate answered/connected
            database.update_outbound_call_status(call_id, "connected")
            logger.info(f"Simulated call {call_id} is now connected.")

        import threading
        def run_sim():
            asyncio.run(simulate_call())
        threading.Thread(target=run_sim).start()

        return {"success": True, "call_id": call_id, "twilio_sid": "simulated", "status": "initiated", "simulated": True}

    # REAL TWILIO MODE
    try:
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Connecting you to FinVoice AI.</Say>
    <Dial>
        <Sip>sip:{room_name}@{os.environ.get("LIVEKIT_SIP_DOMAIN")}</Sip>
    </Dial>
</Response>"""

        client = Client(account_sid, auth_token)
        call = client.calls.create(
            to=req.phone_number,
            from_=twilio_number,
            twiml=twiml,
            status_callback=status_callback,
            status_callback_event=['initiated', 'ringing', 'answered', 'completed']
        )
        logger.info(f"Initiated Twilio call {call.sid} for internal call {call_id}")
        return {"success": True, "call_id": call_id, "twilio_sid": call.sid, "status": "initiated"}
    except Exception as e:
        logger.error(f"Error initiating Twilio call: {e}")
        database.update_outbound_call_status(call_id, "failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/twilio/webhook")
async def twilio_webhook(request: Request):
    call_id = request.query_params.get("call_id")
    room_name = request.query_params.get("room_name") or f"outbound-{call_id}"
    livekit_sip_domain = os.environ.get("LIVEKIT_SIP_DOMAIN")

    if not livekit_sip_domain:
        logger.error("LIVEKIT_SIP_DOMAIN is not set!")
        return Response(content="<Response><Say>System configuration error.</Say></Response>", media_type="application/xml")

    # Update status to answered when webhook is hit (user picked up)
    if call_id:
        database.update_outbound_call_status(call_id, "answered")

    # Connect the call to LiveKit SIP using the provided room name
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial>
        <Sip>sip:{room_name}@{livekit_sip_domain}</Sip>
    </Dial>
</Response>"""
    return Response(content=twiml, media_type="application/xml")

@app.post("/api/twilio/status")
async def twilio_status(request: Request):
    call_id = request.query_params.get("call_id")
    form_data = await request.form()
    call_status = form_data.get("CallStatus")

    if call_id and call_status:
        logger.info(f"Call {call_id} status changed to {call_status}")

        # Map Twilio status to internal status
        status_map = {
            "queued": "initiated",
            "initiated": "initiated",
            "ringing": "ringing",
            "in-progress": "connected",
            "completed": "completed",
            "busy": "busy",
            "no-answer": "no_answer",
            "canceled": "no_answer",
            "failed": "failed"
        }

        internal_status = status_map.get(call_status, call_status)
        database.update_outbound_call_status(call_id, internal_status)

    return Response(content="OK")

@app.get("/api/outbound-calls")
async def get_outbound_calls():
    calls = database.get_outbound_calls()
    return {"calls": calls}
