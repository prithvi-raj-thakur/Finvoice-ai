import os

from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv(".env.local")
client = Client(os.environ.get("TWILIO_ACCOUNT_SID"), os.environ.get("TWILIO_AUTH_TOKEN"))

calls = client.calls.list(parent_call_sid="CA237ddca652fb4081cfa76edadc85d091")
for call in calls:
    print(f"Child Call SID: {call.sid}")
    print(f"Status: {call.status}")
    print(f"To: {call.to}")
