import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("GEMINI_API_KEY not found")
else:
    genai.configure(api_key=api_key)
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content("Hello")
        print(f"Success! Response: {response.text}")
    except Exception as e:
        print(f"Error testing model: {e}")
