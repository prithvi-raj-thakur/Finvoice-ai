import asyncio
import os
from livekit import api, rtc
from livekit.agents.llm import ChatMessage
from dotenv import load_dotenv

load_dotenv('.env.local')

async def main():
    url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    room = rtc.Room()
    
    @room.on("data_received")
    def on_data_received(data: bytes, participant: rtc.RemoteParticipant, kind: rtc.DataPacketKind):
        print("Data received:", data.decode())
        
    @room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant):
        print(f"Track subscribed from {participant.identity}")

    token = api.AccessToken(api_key, api_secret) \
        .with_identity("test_diagnostic_user") \
        .with_name("Test User") \
        .with_grants(api.VideoGrants(room_join=True, room="voice_assistant_room_test")) \
        .to_jwt()

    print("Connecting to room...")
    await room.connect(url, token)
    print("Connected!")
    
    # Send a chat message (AgentSession will treat it as user input if ChatManager is active,
    # but wait, AgentSession ~1.4 handles chat via ChatManager or data channel?)
    # AgentSession automatically handles rtc.ChatManager messages!
    chat = rtc.ChatManager(room)
    
    await asyncio.sleep(2)
    print("Sending text message...")
    await chat.send_message("Hello Anisha, what can you do?")
    
    print("Waiting for response...")
    await asyncio.sleep(15)
    
    await room.disconnect()

asyncio.run(main())
