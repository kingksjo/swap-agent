# Miye MVP

This project is a proof-of-concept MVP of Miye. It combines:

- 🌀 **AutoSwap SDK** – for token swap aggregation on StarkNet
- 🧑‍💻 **FastAPI (Python)** – wraps the SDK into HTTP/Websocket endpoints
- 🤖 **LangChain Agent (Python)** – interprets user intent and calls the backend endpoints
- 💬 **Web Chat UI** – lightweight frontend for user interaction

## 🚀 System Overview

The project enables users to interact with the AutoSwap SDK via natural language.
A user can say things like:

> "Swap 10 ETH for USDC"

And the LangChain agent will:

1. Parse the intent & parameters (token, amount, action)
2. Call the FastAPI backend endpoint (`/swap`)
3. Backend executes the swap using autoswap-sdk
4. User gets a result/transaction receipt in the chat

## 🏗️ Architecture

![System Architecture Diagram](./sys-archtr.png)



## 📂 Repository Structure

```
.
├── backend/              # Node.js + autoswap-sdk wrapper
├── agent/                # Python LangChain agent
├── frontend/             # Web chat UI
├── README.md             # Project overview
├── BACKEND_SETUP.md      # Setup guide for Node.js service
├── AGENT_SETUP.md        # Setup guide for Python agent
├── FRONTEND_SETUP.md     # Setup guide for frontend UI
└── WORKFLOW.md           # System integration & data flow
```

## ⚡ Quick Start

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd autoswap-agent
```

### 2. Set up the backend
See [BACKEND_SETUP.md](BACKEND_SETUP.md)

### 3. Set up the agent
See [AGENT_SETUP.md](AGENT_SETUP.md)

### 4. Run the frontend
See [FRONTEND_SETUP.md](FRONTEND_SETUP.md)

## 📝 Hackathon Notes

- Docker is not required for initial setup (local only)
- Focus is on MVP integration: user prompt → agent → backend → blockchain → response
- Stretch goals: add wallet integrations, persist conversation state, deploy via Docker