import asyncio

from dotenv import load_dotenv

load_dotenv('.env.local')
from livekit.agents.llm import ChatContext
from livekit.plugins import google


async def main():
    llm = google.LLM(model='gemini-2.0-flash')
    ctx = ChatContext().append(text='Hello')
    try:
        res = await llm.chat(chat_ctx=ctx)
        print('SUCCESS:', res)
    except Exception as e:
        print('FAILED 2.0:', e)

    llm2 = google.LLM(model='gemini-1.5-flash')
    ctx2 = ChatContext().append(text='Hello')
    try:
        res2 = await llm2.chat(chat_ctx=ctx2)
        print('SUCCESS 1.5:', res2)
    except Exception as e:
        print('FAILED 1.5:', e)

asyncio.run(main())
