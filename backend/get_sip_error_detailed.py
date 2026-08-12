import os

from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv(".env.local")
client = Client(os.environ.get("TWILIO_ACCOUNT_SID"), os.environ.get("TWILIO_AUTH_TOKEN"))

call = client.calls("CAff9164f8fa0586e6c8965f89a1931495").fetch()
print(f"Call {call.sid} to {call.to}")
print(f"Status: {call.status}")
print(f"Duration: {call.duration}")

# Print all properties to find the sip response code
for attr in dir(call):
    if not attr.startswith("_"):
        val = getattr(call, attr)
        if not callable(val) and val is not None:
            print(f"{attr}: {val}")
