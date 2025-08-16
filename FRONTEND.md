# FRONTEND_SETUP.md

> Guide for wiring the current **SwapAI** frontend to the Python **LangChain agent** and the Node/TypeScript **autoswap-sdk** backend, with concrete fixes and design improvements for a hackathon-ready MVP (no Docker).

---

## 1) Snapshot of the current frontend

From the latest screen + notes:

* Header with **SwapAI** logo, tabs **Trade / Explore / Pool**, a central **search** bar, a **settings (gear)** icon, and a top-right **wallet chip** (shows `0x4a28…55bd`).&#x20;
* Center card prompting **“Connect Wallet”** with a primary button, yet the wallet chip already shows as connected (state mismatch).&#x20;
* A **welcome chat bubble** with example prompts (e.g., “Swap 0.5 ETH to USDC”, “Buy 100 DAI using ETH”, “What’s the best rate for UNI?”).&#x20;
* Bottom **“Ask SwapAI”** input (microphone icon; no visible streaming/voice feedback yet).&#x20;

**Conclusion:** visually strong, but some logic is inconsistent (wallet modal vs. connected badge), and it does not yet call the Python agent / Node backend.

---

## 2) What this frontend must do (MVP)

* Send **natural-language prompts** to the **Python agent**.
* Render **agent replies** (text + optional structured actions).
* When the agent performs a swap:

  * Show **pre-trade summary** (route, min received, est. fees).
  * On confirmation, have the **agent** call the backend and return a **tx hash**.
  * Show **status updates** (pending → success/failed).
* Manage **recipient address**:

  * If a StarkNet wallet is connected: default to that address.
  * If not: allow manual address entry (MVP friendly).

> For this MVP the **server wallet** executes swaps (testnet funds), so wallet connect is optional. We still keep the UI element because it’s useful for “recipient” and for post-hackathon **user-signed** flow.

---

## 3) Required fixes to the current UI

1. **Wallet state bug**

   * Hide the “Connect Wallet” card when a wallet is connected (source of truth: `walletAddress !== undefined`).
   * If you keep the card for onboarding, render it **only** when disconnected. The current screen shows both at once.&#x20;

2. **StarkNet first**

   * Replace any EVM-only logic with **StarkNet** wallet detection (e.g., Argent X / Braavos) *or* keep it off for MVP and rely on manual “recipient address” (faster).
   * Update token lists to **StarkNet addresses/decimals** (align with the backend allow-list).

3. **Agent wiring**

   * All chat input goes to the **Python agent** (`/chat`).
   * The frontend **never** calls the Node backend directly (agent orchestrates tools).

4. **Consistent message model**

   * Adopt a small, typed message schema (below) so the UI knows how to render quotes, confirmations, and transaction receipts.

---

## 4) Environment & configuration

Create a `.env.local` (or similar) in the frontend:

```bash
VITE_AGENT_URL=http://localhost:8000      # FastAPI from AGENT_SETUP.md
VITE_AGENT_KEY=dev-agent-key               # Optional if you add key auth on agent
VITE_APP_NAME=SwapAI
```

Load these in your frontend config and use `import.meta.env`.

---

## 5) API contract (frontend ↔ agent)

### Request

```json
POST /chat
Headers:
  Content-Type: application/json
  x-agent-key: <optional>

Body:
{
  "message": "Swap 0.5 ETH to USDC with max 1% slippage, send to 0xabc...",
  "session_id": "uuid-or-random",      // keep conversation state
  "context": {
    "recipient": "0x... optional",
    "defaults": { "slippage_bps": 100 } // 1% default
  }
}
```

### Response (recommend returning a list of UI events)

```json
{
  "messages": [
    { "type": "assistant_text", "text": "I can swap 0.5 ETH → USDC. Here's the route and min received…" },
    {
      "type": "swap_quote",
      "data": {
        "from": "ETH",
        "to": "USDC",
        "amount": "0.5",
        "min_received": "###",
        "route": ["PoolA", "PoolB"],
        "price_impact_bps": 45,
        "slippage_bps": 100
      }
    },
    { "type": "confirmation_request", "action_id": "act_123" }
  ]
}
```

On user confirm, the frontend posts:

```json
POST /confirm
{
  "action_id": "act_123",
  "confirm": true
}
```

And the agent replies:

```json
{
  "messages": [
    { "type": "assistant_text", "text": "Executing the swap now…" },
    { "type": "swap_result", "data": { "tx_hash": "0x...", "status": "PENDING" } }
  ]
}
```

> If your current agent only returns a single `{"response": "text"}`, keep it, but you’ll lose rich UI. The above schema is recommended for a better UX.

---

## 6) Frontend code changes (step-by-step)

### A) API client

```ts
// src/lib/agentClient.ts
export type AgentMessage =
  | { type: 'assistant_text'; text: string }
  | { type: 'swap_quote'; data: { from: string; to: string; amount: string; min_received?: string; route?: string[]; slippage_bps?: number; price_impact_bps?: number } }
  | { type: 'confirmation_request'; action_id: string }
  | { type: 'swap_result'; data: { tx_hash: string; status: string } }
  | { type: 'error'; code: string; message: string };

export async function sendToAgent(input: string, ctx?: any): Promise<AgentMessage[]> {
  const res = await fetch(`${import.meta.env.VITE_AGENT_URL}/chat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(import.meta.env.VITE_AGENT_KEY ? { 'x-agent-key': import.meta.env.VITE_AGENT_KEY } : {})
    },
    body: JSON.stringify({ message: input, session_id: crypto.randomUUID(), context: ctx })
  });
  if (!res.ok) throw new Error(`Agent error: ${res.status}`);
  const json = await res.json();
  return json.messages || [{ type: 'assistant_text', text: json.response ?? '' }];
}
```

### B) Chat input → agent

Replace local mock/NLP calls with:

```ts
const msgs = await sendToAgent(userText, {
  recipient: walletAddress ?? manualRecipient,
  defaults: { slippage_bps: userSlippageBps }
});
appendToChat(msgs);
```

### C) Rendering structured replies

* If `assistant_text` → render as normal chat bubbles.
* If `swap_quote` → render a **SwapCard** with **route + min received + slippage** and a **Confirm** button.
* On **Confirm** → hit `/confirm` on the agent; then show `swap_result` with a **block explorer link**.
* Add **status polling** by calling `/status?tx_hash=…` on the **agent** (which calls the backend). Show real-time updates.

### D) Fix wallet modal logic

```ts
const isConnected = Boolean(walletAddress);
return (
  <>
    {!isConnected && <ConnectWalletCard />}  {/* only when disconnected */}
    <ChatArea />                             {/* always visible */}
  </>
);
```

---

## 7) Token lists & formatting (StarkNet)

* Replace any EVM token lists with **StarkNet addresses/decimals** (match your backend’s `GET /tokens`).
* Keep a **small allow-list** for the MVP to avoid scam tokens (ETH, STRK, USDC).
* Format amounts by decimal per token (use the decimals returned by `/tokens`).

---

## 8) UX improvements to consider

1. **“Why this route?”** pane

   * When showing `swap_quote`, include a small disclosure that summarizes **price impact**, **fees**, **liquidity source(s)** in plain language.

2. **Safety rails**

   * If token not in allow-list → show a noticeable warning and require a second confirmation (or block outright in MVP).

3. **State persistence**

   * Save **default slippage**, **last tokens**, and **manual recipient** in localStorage.

4. **Clear network banner**

   * Badge: **StarkNet Sepolia** vs **Mainnet** so testers don’t confuse networks.

5. **Voice UX (optional)**

   * The mic icon is present but not functional; add a subtle ripple/recording state and convert speech → text, then forward to the agent.

6. **Empty states / errors**

   * Friendly error cards for `INSUFFICIENT_FUNDS`, `INSUFFICIENT_ALLOWANCE`, `SLIPPAGE` with one-tap retries (increase slippage, reduce amount, run `approve`).

---

## 9) Minimal component checklist

* `HeaderBar`

  * Tabs (Trade/Explore/Pool) are static for MVP.
  * Network badge + wallet chip.

* `ConnectWalletCard`

  * Shown only when disconnected.
  * For MVP, allow **manual recipient input** if wallet not connected.

* `ChatArea`

  * Message list + input box.
  * Sends to agent; renders structured messages.

* `SwapCard`

  * Renders `swap_quote`.
  * Confirm → POST `/confirm`.
  * Shows `swap_result` and status updates.

* `Toast/Notifications`

  * Success/failure messages, copy tx hash.

---

## 10) Local run (no Docker)

1. Ensure **backend** (Node) and **agent** (FastAPI) are running per their setup files.
2. Start the frontend:

```bash
npm install
npm run dev
# or: pnpm dev / yarn dev
```

3. Open the app, try:

   * “Swap 0.5 ETH to USDC with 1% slippage; recipient 0x…”.
   * Confirm the quote → see a tx hash → watch status progress.

---

## 11) Testing plan (frontend)

* **Unit**:

  * `agentClient` → mock fetch and assert parsing → `assistant_text`, `swap_quote`, `swap_result`.
* **Integration** (local):

  * Run backend + agent with small amounts on StarkNet Sepolia testnet.
* **Manual**:

  * Disconnect wallet: confirm **Connect** card appears.
  * Connect wallet: card disappears, recipient defaults to wallet address.
  * Error cases: test insufficient funds and slippage bumps.

---

## 12) Known gaps & future upgrades

* Move from server-signed swaps to **user-signed** (agent returns calldata → frontend signs with wallet).
* Streaming replies via **SSE/WebSocket** for richer chat experience.
* Real token search (use backend `/tokens` and Debounce).
* The current design shows both **wallet chip** and **connect card** simultaneously—this has been fixed above; keep it enforced in code reviews.&#x20;

---

## 13) What changed vs. the current UI

* Kept visual language (dark theme, tabs, search, chat) but **corrected wallet gating** and **wired the chat** to the **agent** instead of local mocks.
* Introduced **structured message handling** to support quotes, confirmations, receipts.
* Clarified recipient handling and **StarkNet-first** token/network settings.

---

