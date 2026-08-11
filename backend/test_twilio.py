import os
import sys
from twilio.rest import Client
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env.local")
load_dotenv(env_path, override=True)
account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
twilio_number = os.environ.get("TWILIO_PHONE_NUMBER")
livekit_domain = os.environ.get("LIVEKIT_SIP_DOMAIN")

client = Client(account_sid, auth_token)

twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial>
        <Sip>sip:test_room@{livekit_domain}</Sip>
    </Dial>
</Response>"""

try:
    call = client.calls.create(
        to="+1234567890", # Use a dummy valid format
        from_=twilio_number,
        twiml=twiml
    )
    print("Success:", call.sid)
except Exception as e:
    print("Twilio Error:", type(e).__name__, str(e))
