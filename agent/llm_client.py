# agent/llm_client.py
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv


load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",  # GPT-OSS 20B on Groq
    temperature=0.7,
    api_key=os.getenv("GOOGLE_API_KEY")
)