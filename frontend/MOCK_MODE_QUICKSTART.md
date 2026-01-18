# Quick Start: Mock Mode Setup

## 🚀 Quick Setup (3 steps)

### 1. Create/Update your `.env` file

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` and add:

```bash
VITE_USE_MOCK_DATA=true
```

### 2. Restart your dev server

```bash
npm run dev
```

### 3. Test it out!

You should see a **🎭 Mock Mode Active** indicator in the top-right corner.

Try these commands in the chat:

- `hello`
- `swap 1 eth to usdc`
- `what is slippage`
- `help`

---

## 📖 Full Documentation

See [MOCK_MODE_GUIDE.md](./MOCK_MODE_GUIDE.md) for complete documentation including:

- How to add custom mock responses
- All available mock commands
- Troubleshooting tips
- Advanced usage

## 🔄 Switch Back to Real Backend

Edit `.env`:

```bash
VITE_USE_MOCK_DATA=false
VITE_AGENT_URL=http://localhost:8000
```

Then restart the dev server.

---

## ✨ What You Get

✅ **No backend needed** for UI development  
✅ **Realistic delays** simulating network latency  
✅ **Full swap flow** from quote to execution  
✅ **Visual indicator** showing mock mode status  
✅ **Console logs** for debugging  
✅ **Easy to extend** with custom responses

Happy coding! 🎨
