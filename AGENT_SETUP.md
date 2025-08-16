
# 🤖 Agent Setup (LangChain + Python)

The **Agent** is the natural language interface for the system.
It uses **LangChain** + an **LLM** to interpret user prompts (e.g., "Swap 1 ETH for USDC") and then calls the **backend service** endpoints (`/swap`, `/quote`, etc.) to execute swaps.

---

## 🔧 Prerequisites

* Python **3.10+**
* `pip` or `poetry` for package management
* Running backend service (see [BACKEND\_SETUP.md](./BACKEND_SETUP.md))

---

## 📦 Installation

1. Create and activate a virtual environment:

   ```bash
   cd agent
   python -m venv .venv
   source .venv/bin/activate   # Mac/Linux
   .venv\Scripts\activate      # Windows
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

   Example `requirements.txt`:

   ```txt
   langchain
   langchain-openai   # or another LLM provider
   requests
   fastapi
   uvicorn
   python-dotenv
   ```

---

## ⚙️ Environment Variables

Create a `.env` file in the `agent/` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
BACKEND_URL=http://localhost:3000   # URL of the Node backend
```

---

## 🛠️ Project Structure

```
agent/
├── main.py            # FastAPI server exposing the agent
├── tools.py           # Custom tools for calling backend endpoints
├── agent.py           # LangChain agent definition
├── requirements.txt   # Python dependencies
└── .env               # Environment variables
```

---

## 🧩 Implementation Details

### `tools.py`

Defines tools the agent can use (swap, quote, check status, etc.):

```python
import requests
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")

def swap_tokens(token_in: str, token_out: str, amount: float):
    resp = requests.post(f"{BACKEND_URL}/swap", json={
        "token_in": token_in,
        "token_out": token_out,
        "amount": amount
    })
    return resp.json()

def get_quote(token_in: str, token_out: str, amount: float):
    resp = requests.post(f"{BACKEND_URL}/quote", json={
        "token_in": token_in,
        "token_out": token_out,
        "amount": amount
    })
    return resp.json()
```

---

### `agent.py`

Defines the LangChain agent with tools:

```python
from langchain.agents import initialize_agent, Tool
from langchain_openai import ChatOpenAI
from tools import swap_tokens, get_quote

llm = ChatOpenAI(temperature=0)

tools = [
    Tool(
        name="Swap Tool",
        func=lambda q: swap_tokens(q["token_in"], q["token_out"], q["amount"]),
        description="Use this to execute a token swap. Input: {token_in, token_out, amount}."
    ),
    Tool(
        name="Quote Tool",
        func=lambda q: get_quote(q["token_in"], q["token_out"], q["amount"]),
        description="Use this to get swap quotes. Input: {token_in, token_out, amount}."
    )
]

agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)
```

---

### `main.py`

Exposes the agent via FastAPI for frontend integration:

```python
from fastapi import FastAPI
from agent import agent

app = FastAPI()

@app.post("/chat")
async def chat(message: str):
    response = agent.run(message)
    return {"response": response}
```

Run locally:

```bash
uvicorn main:app --reload --port 8000
```

---

## ✅ Testing the Agent

1. Make sure the **backend** is running at `http://localhost:3000`.

2. Start the **agent**:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

3. Test with `curl`:

   ```bash
   curl -X POST "http://localhost:8000/chat" -H "Content-Type: application/json" -d '{"message":"Swap 1 ETH for USDC"}'
   ```

   Example response:

   ```json
   {
     "response": "Successfully swapped 1 ETH for 3200 USDC. Tx hash: 0xabc123..."
   }
   ```

---

## 🏁 Notes

* The **agent logic** is designed to be extended with more tools (approve, balance check, transaction status).
* For hackathon speed: keep the **tool layer thin** → just proxy requests to backend endpoints.
* Add **mock responses** in case the backend is down to continue testing the agent’s reasoning.

---

