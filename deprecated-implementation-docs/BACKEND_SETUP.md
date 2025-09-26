# backend/SETUP.md

> End-to-end setup for a **TypeScript swap backend** that wraps `autoswap-sdk` behind secure HTTP endpoints, ready for local testing and for a Python web agent (LangChain) to call.

---

## Goals

* Provide stable HTTP endpoints for **approve → swap → status** on Starknet.
* Encapsulate `autoswap-sdk` and Starknet specifics behind a minimal API.
* Be **MVP-test-ready** (env schema, validation, logging, error model, tests).
* No Docker (local Node.js only), but production-sane structure.

---

## Tech Stack

* **Runtime:** Node.js ≥ 18 (ES2022, native fetch/WHATWG URL)
* **Lang:** TypeScript
* **HTTP:** Express
* **Validation:** Zod
* **Logging:** pino + pino-http
* **Security:** helmet, cors (allowlist), express-rate-limit, API key
* **Tests:** Vitest + Supertest
* **Chain libs:** `autoswap-sdk`, `starknet` (for ERC-20 approve & tx status)

> `autoswap-sdk` exposes an `AutoSwappr` class and helpers like `TOKEN_ADDRESSES`, plus an `executeSwap` method for routing via contract `0x04de...5c9` (example from package docs). Verify import path/version in your project; the npm readme currently shows usage like:
>
> ```ts
> import { AutoSwappr, TOKEN_ADDRESSES } from 'autoswap-sdk';
> // or (as seen in examples) 'autoswappr-sdk'
> ```
>
> Use the package name installed from npm: **`autoswap-sdk`**. ([npm][1])

---

## Directory Layout

```
backend/
  src/
    app.ts
    index.ts
    config/env.ts
    config/security.ts
    middlewares/error.ts
    middlewares/auth.ts
    routes/health.ts
    routes/tokens.ts
    routes/approve.ts
    routes/swap.ts
    routes/status.ts
    services/autoswap.service.ts
    services/erc20.service.ts
    services/status.service.ts
    utils/addresses.ts
    utils/normalize.ts
    types/api.ts
  test/
    approve.test.ts
    swap.test.ts
    status.test.ts
    fixtures/
      sample-requests.ts
  .env.example
  package.json
  tsconfig.json
  README.md
```

---

## Installation

```bash
# from the repo root or ./backend
npm init -y

npm install \
  express zod dotenv helmet cors express-rate-limit pino pino-http \
  autoswap-sdk starknet

npm install -D \
  typescript ts-node @types/node @types/express vitest supertest \
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Initialize TS:

```bash
npx tsc --init --rootDir src --outDir dist --esModuleInterop --resolveJsonModule true --module ES2022 --target ES2022
```

---

## Environment Variables

`./backend/.env.example`

```dotenv
# Server
PORT=8080
NODE_ENV=development
API_KEYS=local-dev-key-1,local-dev-key-2

# Starknet network (mainnet | sepolia)
NETWORK=sepolia

# Public RPC (choose one)
STARKNET_RPC=https://starknet-sepolia.public.blastapi.io/rpc/v0_9
# Alternatives:
# https://starknet-sepolia.g.alchemy.com/public
# https://starknet-sepolia-rpc.publicnode.com
# https://starknet-sepolia.infura.io/v3/<KEY> (if using Infura)
# See Starknet docs/providers for current endpoints. :contentReference[oaicite:1]{index=1}

# Hot wallet for MVP (DO NOT use in production)
SERVER_ACCOUNT_ADDRESS=0x...
SERVER_PRIVATE_KEY=0x...

# AutoSwappr config
AUTOSWAPPR_ADDRESS=0x04deb7a3d89e7a4a7a03df748de45d81b2dc418f446b9cc837c5cbd8897895c9
DEFAULT_SLIPPAGE_BPS=50        # 0.50%
TX_DEADLINE_SECS=600
```

> Notes:
>
> * The example **AutoSwappr contract** address is taken from the npm docs—update if the package publishes a new deployment. ([npm][1])
> * For Sepolia/Mainnet public RPC options and versioned endpoints, consult Starknet’s provider guide. ([starknetjs.com][2])

---

## Config & Bootstrap

`src/config/env.ts`

```ts
import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_KEYS: z.string().transform(s => s.split(',').map(x => x.trim()).filter(Boolean)),
  NETWORK: z.enum(['mainnet', 'sepolia']).default('sepolia'),
  STARKNET_RPC: z.string().url(),
  SERVER_ACCOUNT_ADDRESS: z.string().min(3),
  SERVER_PRIVATE_KEY: z.string().min(3),
  AUTOSWAPPR_ADDRESS: z.string().min(3),
  DEFAULT_SLIPPAGE_BPS: z.coerce.number().int().nonnegative().default(50),
  TX_DEADLINE_SECS: z.coerce.number().int().positive().default(600),
});

export const env = EnvSchema.parse(process.env);
```

`src/config/security.ts`

```ts
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './env';

export const security = {
  helmet: helmet(),
  cors: cors({ origin: (origin, cb) => cb(null, true), credentials: true }),
  rateLimit: rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true }),
  apiKeyHeader: 'x-api-key',
};
```

`src/middlewares/auth.ts`

```ts
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { security } from '../config/security';

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header(security.apiKeyHeader);
  if (!key || !env.API_KEYS.includes(key)) {
    return res.status(401).json({ error: 'unauthorized', message: 'missing/invalid API key' });
  }
  next();
}
```

`src/middlewares/error.ts`

```ts
import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = (err.status as number) || 500;
  res.status(status).json({
    error: err.code || 'internal_error',
    message: err.message || 'Internal Server Error',
    details: err.details || undefined,
  });
};
```

`src/app.ts`

```ts
import express from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { security } from './config/security';
import { errorHandler } from './middlewares/error';
import { requireApiKey } from './middlewares/auth';

import health from './routes/health';
import tokens from './routes/tokens';
import approve from './routes/approve';
import swap from './routes/swap';
import status from './routes/status';

const app = express();
const logger = pino();

app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '1mb' }));
app.use(security.helmet, security.cors, security.rateLimit);

// public
app.use('/health', health);

// protected
app.use(requireApiKey);
app.use('/tokens', tokens);
app.use('/approve', approve);
app.use('/swap', swap);
app.use('/status', status);

app.use(errorHandler);

export default app;
```

`src/index.ts`

```ts
import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});
```

---

## Chain Utilities

`src/utils/addresses.ts`

```ts
// Common Starknet token addresses (Mainnet shown below). For Sepolia, replace with testnet addresses if needed.
export const ADDR = {
  // From Starknet.js docs:
  STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ETH:  '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
};
// Source: Starknet.js ERC20 guide. :contentReference[oaicite:4]{index=4}
```

`src/utils/normalize.ts`

```ts
export function bpsToFloat(bps: number) {
  return Math.max(0, bps) / 10_000;
}
```

---

## Services

### AutoSwap service (wrapping `autoswap-sdk`)

`src/services/autoswap.service.ts`

```ts
import { AutoSwappr, TOKEN_ADDRESSES } from 'autoswap-sdk';
import { env } from '../config/env';
import { bpsToFloat } from '../utils/normalize';

const instance = new AutoSwappr({
  rpcUrl: env.STARKNET_RPC,
  chainId: env.NETWORK === 'mainnet' ? 1 : 2, // example; align with SDK expectations
  slippage: bpsToFloat(env.DEFAULT_SLIPPAGE_BPS),
  autoSwappr: env.AUTOSWAPPR_ADDRESS,
});

export type SwapParams = {
  fromToken: string;
  toToken: string;
  amount: string;         // human or wei per SDK — normalize upstream
  account: string;        // wallet executing swap (our server account)
  isToken1: boolean;      // token ordering flag per SDK
};

export async function executeSwap(p: SwapParams) {
  // returns tx hash or receipt per SDK; adapt as needed
  return instance.executeSwap({
    fromToken: p.fromToken,
    toToken: p.toToken,
    amount: p.amount,
    account: p.account,
    isToken1: p.isToken1,
  });
}

export const KnownTokens = TOKEN_ADDRESSES;
// Refer to sdk quickstart on usage & address map. :contentReference[oaicite:5]{index=5}
```

> The code mirrors the npm quickstart (`AutoSwappr`, `executeSwap`, `TOKEN_ADDRESSES`). Confirm the **chainId** and **argument shapes** against the version you install. ([npm][1])

### ERC-20 approval (via `starknet`)

`src/services/erc20.service.ts`

```ts
import { Account, Contract, RpcProvider, cairo, json } from 'starknet';
import erc20Abi from './abi/erc20.json' assert { type: 'json' };
import { env } from '../config/env';

const provider = new RpcProvider({ nodeUrl: env.STARKNET_RPC });

const account = new Account(provider, env.SERVER_ACCOUNT_ADDRESS, env.SERVER_PRIVATE_KEY);

export async function approveSpender(token: string, spender: string, amountWei: bigint) {
  const erc20 = new Contract(erc20Abi as json.Abi, token, account);
  const tx = await erc20.approve(spender, cairo.uint256(amountWei));
  const rec = await provider.waitForTransaction(tx.transaction_hash);
  return rec;
}
// Starknet.js ERC20 approve pattern. :contentReference[oaicite:7]{index=7}
```

> Include a minimal `erc20.json` ABI (OpenZeppelin Cairo ERC-20). Any ERC-20-compatible token on Starknet supports `approve(owner, spender, amount)` and `allowance`. ([starknetjs.com][3])

### Tx status polling

`src/services/status.service.ts`

```ts
import { RpcProvider } from 'starknet';
import { env } from '../config/env';

const provider = new RpcProvider({ nodeUrl: env.STARKNET_RPC });

export async function getStatus(txHash: string) {
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    return {
      status: receipt.finality_status || receipt.status,
      block: receipt.block_number,
      execution: receipt.execution_status,
      txHash,
    };
  } catch (e: any) {
    if (e?.message?.includes('not found')) {
      return { status: 'NOT_RECEIVED', txHash };
    }
    throw e;
  }
}
```

---

## Routes & API Shape

### Error Model

```json
{ "error": "string_code", "message": "human readable", "details": { "…": "…" } }
```

### `GET /health` (public)

Returns `{ ok: true }`.

### `GET /tokens` (protected)

Returns curated token list (subset of `TOKEN_ADDRESSES` plus project-specific allowlist).

`src/routes/tokens.ts`

```ts
import { Router } from 'express';
import { KnownTokens } from '../services/autoswap.service';

export default Router().get('/', (_req, res) => {
  res.json({ tokens: KnownTokens });
});
```

### `POST /approve` (protected)

**Body**

```json
{
  "token": "0x...",
  "spender": "0x...",     // usually AUTOSWAPPR_ADDRESS
  "amountWei": "1000000000000000000"
}
```

**Validation & Handler**

`src/routes/approve.ts`

```ts
import { Router } from 'express';
import { z } from 'zod';
import { approveSpender } from '../services/erc20.service';
import { env } from '../config/env';

const Body = z.object({
  token: z.string().min(3),
  spender: z.string().min(3).default(env.AUTOSWAPPR_ADDRESS),
  amountWei: z.string().regex(/^\d+$/),
});

export default Router().post('/', async (req, res, next) => {
  try {
    const b = Body.parse(req.body);
    const rec = await approveSpender(b.token, b.spender, BigInt(b.amountWei));
    res.json({ txHash: rec.transaction_hash, status: rec.finality_status || rec.status });
  } catch (e) { next(e); }
});
```

### `POST /swap` (protected)

**Body**

```json
{
  "fromToken": "0x...",
  "toToken": "0x...",
  "amount": "1.0",
  "isToken1": true
}
```

* `amount` interpretation depends on SDK; normalize to expected unit (human vs wei). Start with **human** string and let your service convert if needed.

`src/routes/swap.ts`

```ts
import { Router } from 'express';
import { z } from 'zod';
import { executeSwap } from '../services/autoswap.service';
import { env } from '../config/env';

const Body = z.object({
  fromToken: z.string().min(3),
  toToken: z.string().min(3),
  amount: z.string().min(1),
  isToken1: z.boolean().default(true),
});

export default Router().post('/', async (req, res, next) => {
  try {
    const b = Body.parse(req.body);
    const out = await executeSwap({
      ...b,
      account: env.SERVER_ACCOUNT_ADDRESS, // server wallet executes the swap for MVP
    });
    res.json(out); // expect { transactionHash, ... } per SDK
  } catch (e) { next(e); }
});
```

> The swap flow uses `AutoSwappr.executeSwap` as shown in the npm quickstart. Adjust field names to match your installed SDK version. ([npm][1])

### `GET /status/:txHash` (protected)

`src/routes/status.ts`

```ts
import { Router } from 'express';
import { getStatus } from '../services/status.service';

export default Router().get('/:txHash', async (req, res, next) => {
  try {
    const status = await getStatus(req.params.txHash);
    res.json(status);
  } catch (e) { next(e); }
});
```

---

## Security Checklist (MVP)

* [ ] **API key** in header `x-api-key` (rotate for demo judges).
* [ ] **Hot wallet** holds only test funds; never reuse in production.
* [ ] **CORS**: restrict to your web agent origin in prod.
* [ ] **Rate limit**: 60 req/min; tune per route if needed.
* [ ] **Logging**: redact secrets; enable request IDs.
* [ ] **Input validation** with Zod on every endpoint.
* [ ] **Replay protection**: for production, add signed nonce per request.

---

## Testing

### Scripts

`package.json` (excerpt)

```json
{
  "type": "module",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc -p .",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Example tests

`test/swap.test.ts`

```ts
import request from 'supertest';
import app from '../src/app';

const key = 'local-dev-key-1';

describe('swap', () => {
  it('rejects without api key', async () => {
    const res = await request(app).post('/swap').send({});
    expect(res.status).toBe(401);
  });

  it('validates body', async () => {
    const res = await request(app).post('/swap').set('x-api-key', key).send({});
    expect(res.status).toBe(400); // from zod error bubble-up
  });
});
```

> For offline CI runs, **mock** SDK calls by wrapping `AutoSwappr` behind our `services/autoswap.service.ts` and swapping it with a fake via dependency injection. Keep one end-to-end test on Sepolia with tiny amounts to validate RPC wiring.

---

## Running Locally (no Docker)

```bash
cp .env.example .env
# fill in SERVER_ACCOUNT_ADDRESS / SERVER_PRIVATE_KEY with a Sepolia test wallet
# fund it with STRK/ETH test tokens if needed

npm run dev
# Backend: http://localhost:8080
```

### Quick cURL Smoke Tests

```bash
curl http://localhost:8080/health

curl -H "x-api-key: local-dev-key-1" http://localhost:8080/tokens

curl -X POST http://localhost:8080/approve \
  -H "content-type: application/json" -H "x-api-key: local-dev-key-1" \
  -d '{"token":"0xTOKEN","spender":"AUTOSWAPPR_ADDRESS","amountWei":"1000000000000000"}'

curl -X POST http://localhost:8080/swap \
  -H "content-type: application/json" -H "x-api-key: local-dev-key-1" \
  -d '{"fromToken":"0xTOKEN_A","toToken":"0xTOKEN_B","amount":"1.0","isToken1":true}'
```

---

## Python Agent ↔ Endpoint (contract)

Your **LangChain** agent calls:

* `POST /approve` before first swap for a token pair.
* `POST /swap` to execute.
* `GET /status/:txHash` to poll until `{ status: "ACCEPTED_ON_L2" | "ACCEPTED_ONCHAIN" | "REJECTED" }`.

Include `x-api-key` and backoff-retry on HTTP 429/503.

---

## Troubleshooting

* **`ECONNRESET` / timeouts:** use stable RPCs (Blast/Alchemy/Infura) and match RPC **spec version** with your Starknet lib version (v0.8/v0.9 guidance in docs). ([starknetjs.com][4])
* **`approve` stuck:** ensure spender = `AUTOSWAPPR_ADDRESS` and allowance ≥ swap `amount`. ERC-20 approve/allowance patterns are standard on Starknet. ([starknetjs.com][3])
* **Import mismatch (`autoswappr-sdk` vs `autoswap-sdk`):** install from npm **`autoswap-sdk`**; verify exports locally (`node -e "console.log(Object.keys(require('autoswap-sdk')))"`). The readme examples show both forms—prefer the actual installed name. ([npm][1])

---

## References

* `autoswap-sdk` npm page (Quickstart, contract address, usage). ([npm][1])
* Starknet provider & RPC versioning (v0.8/v0.9 endpoints, Sepolia/Mainnet). ([starknetjs.com][4])
* Public Sepolia endpoints (Blast, Alchemy, PublicNode). ([Alchemy][5], [CompareNodes.com][6])
* ERC-20 approve on Starknet.js (examples & addresses for STRK/ETH). ([starknetjs.com][3])

---

## Production Notes (Post-Hackathon)

* Move hot wallet to **user-signed** flow (server provides route/quote, web wallet signs).
* Add **observability** (OpenTelemetry traces, structured logs to a sink).
* Secrets in **KMS** (not `.env`), per-route **rate limits**, and **nonce-based request signing**.

[1]: https://www.npmjs.com/package/autoswap-sdk "autoswap-sdk - npm"
[2]: https://starknetjs.com/docs/guides/connect_network/?utm_source=chatgpt.com "RpcProvider object connect to the network - Starknet.js"
[3]: https://starknetjs.com/docs/next/guides/contracts/use_ERC20/?utm_source=chatgpt.com "ERC20 tokens | Starknet.js"
[4]: https://starknetjs.com/docs/next/guides/provider_instance/?utm_source=chatgpt.com "Provider - Starknet.js"
[5]: https://www.alchemy.com/rpc/starknet-sepolia?utm_source=chatgpt.com "Starknet Sepolia RPC URL & devtools | Alchemy"
[6]: https://www.comparenodes.com/library/public-endpoints/starknet/?utm_source=chatgpt.com "Starknet Public / Free RPC Endpoints & Blockchain APIs"
