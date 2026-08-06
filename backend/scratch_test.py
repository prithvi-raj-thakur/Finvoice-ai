import os
import asyncio
from dotenv import load_dotenv
from livekit.plugins import google
from livekit.agents import llm

load_dotenv('.env.local')

async def test():
    try:
        m = google.LLM(model='gemini-3.5-flash')
        ctx = llm.ChatContext()
        ctx.add_message(role="user", content="hello")
        stream = m.chat(chat_ctx=ctx)
        async for chunk in stream:
            print(chunk)
        print("Success 3.5-flash!")
    except Exception as e:
        print("Error:", repr(e))

asyncio.run(test())
