import os, json
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv('.env.local')

client = OpenAI(base_url='https://api.groq.com/openai/v1', api_key=os.environ.get('GROQ_API_KEY'))

MAIN_AGENT_PROMPT = """
You are Anisha, the Main FinVoice AI Assistant.
Your goal is to guide the user through general financial queries and ROUTE them to the correct specialist when needed.

IMPORTANT RULES:
1. Speak conversationally (English, Hindi, Code-Mixed). Keep it to 1-3 short sentences.
2. DO NOT try to answer specialist questions yourself. You MUST transfer the user.
3. ROUTING RULES:
   - For Government schemes or eligibility, TRIGGER the `handoff_to_scheme_specialist` tool.
   - For Fraud or scams, TRIGGER the `handoff_to_fraud_specialist` tool.
   - For Financial concepts (EMI, Interest), TRIGGER the `handoff_to_financial_literacy` tool.
   - For Documents needed, TRIGGER the `handoff_to_document_specialist` tool.
   - For Application steps, TRIGGER the `handoff_to_application_assistant` tool.
4. Gather a brief 1-sentence context before handing off, then execute the tool.
5. Use `create_escalation` ONLY if the user explicitly asks for human support.
6. Use `save_user_memory` to save preferences, but ask for consent first.
"""

memory_context = '\n\n[SYSTEM MEMORY INJECTION]\nYou already know this user. Their memory profile is: {}. Use this context naturally.'
prompt = MAIN_AGENT_PROMPT + memory_context

try:
    response = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[{'role': 'system', 'content': prompt}, {'role': 'user', 'content': 'Hello, who are you?'}],
    )
    print('RESPONSE:')
    print(response.choices[0].message.content)
except Exception as e:
    print('ERROR:', e)
