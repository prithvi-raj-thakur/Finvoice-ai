import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv(".env.local")
client = Client(os.environ.get("TWILIO_ACCOUNT_SID"), os.environ.get("TWILIO_AUTH_TOKEN"))

calls = client.calls.list(limit=20)
for call in calls:
    print(f"Call SID: {call.sid}")
    print(f"Status: {call.status}")
    print(f"To: {call.to}")
    print(f"Start Time: {call.start_time}")
    print("-" * 40)
