
import requests

payload = {
    "phone_number": "+1234567890",
    "user_id": "test",
    "room_name": "test_room"
}
try:
    res = requests.post("http://localhost:8000/api/outbound-call", json=payload)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Request failed: {e}")
