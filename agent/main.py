from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from llm_client import llm  # our existing Groq LLM client

# Define our input/output models for type safety and validation
class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    messages: list[dict]  # Structured format for frontend

app = FastAPI()

@app.post("/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    try:
        # Build LLM prompt with system instructions if provided
        messages = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        
        messages.append({"role": "user", "content": request.message})
        
        # Get response from our Groq LLM
        response = llm.invoke(messages)

        # Return in structured format for frontend
        return ChatResponse(
            messages=[
                {
                    "type": "assistant_text",
                    "text": response.content
                }
            ]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

