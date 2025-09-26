# Backend Task Split (Simple)

Split backend work between **2 developers** to build in parallel.

## 👥 Who Does What

### **Person A: Infrastructure**

Sets up the foundation - server, security, config

### **Person B: API & Services**

Builds the endpoints and business logic

---

## �️ Person A Tasks

### 1. Project Setup (30 min)

```bash
mkdir -p backend/src/{config,middlewares,routes,services,utils,types}
cd backend
npm init -y
npm install express zod dotenv helmet cors express-rate-limit
npm install -D typescript ts-node @types/node @types/express nodemon
```

### 2. Core Files (45 min)

- `src/config/env.ts` - Environment variables
- `src/middlewares/auth.ts` - API key check
- `src/middlewares/error.ts` - Error handling
- `src/app.ts` - Express app setup

### 3. Server Start (15 min)

- `src/index.ts` - Start server on port 8080
- `package.json` - Add dev scripts

---

## � Person B Tasks

### 1. Types & Utils (30 min)

- `src/types/api.ts` - Request/response types
- `src/utils/addresses.ts` - Token addresses
- Mock data helpers

### 2. Services (60 min)

- `src/services/swap.service.ts` - Mock swap logic
- `src/services/quote.service.ts` - Mock price quotes
- `src/services/status.service.ts` - Mock transaction status

### 3. API Routes (45 min)

- `src/routes/health.ts` - Health check
- `src/routes/swap.ts` - POST /swap endpoint
- `src/routes/quote.ts` - GET /quote endpoint
- `src/routes/status.ts` - GET /status endpoint

---

## 🤝 Coordination

### Work Together On:

- `src/app.ts` - Person A creates structure, Person B adds routes

### Handoffs:

1. Person A finishes config → Person B uses in services
2. Person B finishes types → Person A uses in middleware
3. Both test together at the end

---

## ✅ Done When:

- Server starts on port 8080
- All endpoints respond with mock data
- API key authentication works
- Ready for Python agent to call

**Time estimate: ~2 hours total**
