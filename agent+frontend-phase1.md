### Plan overview
I’ll make minimal, reversible edits to get contextual agent replies flowing into the frontend without touching the swap execution path yet. Changes are grouped by Agent (Python) and Frontend (React), plus small config files.

### Agent (Python/FastAPI)
- • Add session/context support to `/chat`
  - What: Extend `ChatRequest` to include `session_id?: string` and `context?: object`; maintain an in-memory store keyed by `session_id` with the last few turns.
  - Why: Enables contextual replies across multiple user messages.
  - Files: `agent/main.py`.

- • Build prompts with conversation history
  - What: Construct the LLM `messages` array from stored history + the current user message; cap history for token safety.
  - Why: Makes responses reference prior turns.

- • Keep response schema as `messages[]` with `assistant_text`
  - What: Continue returning:
    - `{"messages":[{ "type":"assistant_text", "text": "<LLM output>" }]}`
  - Why: Matches current frontend capability; richer types can come later.

- • Add CORS and optional API key check
  - What: Enable CORS for `http://localhost:5173`; if `AGENT_API_KEY` is set, require `x-agent-key` on requests.
  - Why: Allow the frontend dev server to call the agent and optionally protect public demos.

- • Env example
  - What: Add `.env.example` with `PORT=8000`, `BACKEND_URL=http://localhost:8080`, `AGENT_API_KEY=dev-agent-key`, `GROQ_API_KEY=...`.
  - Why: Clear local setup; aligns with `WORKFLOW.md`.

- • Defer `/confirm` for now (optional skeleton)
  - What: Optionally add a no-op `/confirm` that returns a friendly “not implemented yet” message.
  - Why: Keeps surface area small while focusing on contextual text. We’ll add real action handling next.

### Frontend (Vite/React)
- • Create a tiny API client to call the agent
  - What: Add `src/lib/agentClient.ts`:
    - `sendToAgent(input: string, sessionId: string, ctx?: any): Promise<{ type: 'assistant_text'; text: string }[]>`
    - POST `${import.meta.env.VITE_AGENT_URL}/chat` with `{ message, session_id, context }` and optional `x-agent-key`.
  - Why: Centralized call site and future-proof for `/confirm`.

- • Maintain a `sessionId` per tab
  - What: Generate one UUID on mount and reuse it for all chat calls (e.g., `useRef(crypto.randomUUID())`).
  - Why: Lets the agent group and remember a conversation.

- • Wire `App.tsx` to use the agent
  - What:
    - Update `handleSendMessage` to:
      - Stop using `NLPProcessor`/`SwapService` for chat.
      - Call `sendToAgent(...)` and append returned `assistant_text` as `assistant` messages.
    - Allow sending messages even if the wallet is disconnected (show a tip, but don’t block chat).
  - Why: Unblocks immediate contextual responses. SwapCard/quote mocks remain intact for now.

- • Frontend env
  - What: Add `.env.local.example` with `VITE_AGENT_URL=http://localhost:8000` and optional `VITE_AGENT_KEY=dev-agent-key`.
  - Why: Simple configuration for dev.

### Non-goals in this pass
- No backend wiring for swaps yet (no `/confirm`, `/swap` calls).
- No structured `swap_quote` or `swap_result` messages yet.
- No persistence beyond in-memory session context.

### Risks/impact
- Low-risk; isolated to `agent/main.py`, a new `agentClient`, and a small `App.tsx` change path.
- Frontend UX impact: chat no longer blocked by wallet gating; swap execution card still uses current mock.

### Acceptance criteria
- Sending two related prompts results in the second response referencing the prior turn.
- Frontend renders agent replies (assistant bubbles) via `messages[]`.
- No wallet connection required to test contextual chat.

### Test steps
- Start agent (`uvicorn main:app --reload --port 8000`) with `GROQ_API_KEY` set.
- Start frontend (`npm run dev`) with `VITE_AGENT_URL=http://localhost:8000`.
- In the UI:
  - Send “Swap 0.5 ETH to USDC”.
  - Then send “Make it 1% slippage, same tokens.”
  - The second reply should reference prior context.

If this plan looks good, I’ll implement it exactly as described.