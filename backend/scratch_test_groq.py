import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
import asyncio

load_dotenv(".env.local")

async def test_llm():
    print("Testing LLM...")
    client = AsyncOpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.environ.get("GROQ_API_KEY"),
    )
    
    try:
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "Hello, tell me a 5 word joke."}],
        )
        print(response.choices[0].message.content)
        print("\n\nSuccess!")
    except Exception as e:
        print(f"\n\nError: {e}")

if __name__ == "__main__":
    asyncio.run(test_llm())
