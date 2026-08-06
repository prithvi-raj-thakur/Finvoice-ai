import os
import urllib.request
from dotenv import load_dotenv

load_dotenv('.env.local')

deepgram_key = os.getenv('DEEPGRAM_API_KEY')
google_key = os.getenv('GOOGLE_API_KEY')
murf_key = os.getenv('MURF_API_KEY')

print('--- TESTING KEYS ---')

try:
    req = urllib.request.Request('https://api.deepgram.com/v1/projects', headers={'Authorization': f'Token {deepgram_key}'})
    urllib.request.urlopen(req)
    print('Deepgram: OK')
except Exception as e:
    print(f'Deepgram: FAILED - {e}')

try:
    req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models?key={google_key}')
    urllib.request.urlopen(req)
    print('Google Gemini: OK')
except Exception as e:
    print(f'Google Gemini: FAILED - {e}')

try:
    req = urllib.request.Request('https://api.murf.ai/v1/speech/voices', headers={'api-key': murf_key, 'Content-Type': 'application/json', 'Accept': 'application/json'})
    urllib.request.urlopen(req)
    print('Murf: OK')
except Exception as e:
    print(f'Murf: FAILED - {e}')
