import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None

def ask_ai(message: str, products_context: str = "") -> str:
    if not client:
        return "ERROR: GEMINI_API_KEY missing"
    if not products_context:
        products_context = "No products found"
    prompt = f"You are a friendly shopping assistant. Products: {products_context} User: {message} Suggest with Rs price, short."
    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"GEMINI ERROR: {e}")
        return f"AI Error: {e}"
