# agent/llm_client.py
import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv


load_dotenv()

llm = ChatGroq(
    model_name="openai/gpt-oss-20b",  # GPT-OSS 20B on Groq
    temperature=0.6,
    api_key=os.getenv("GROQ_API_KEY")
)