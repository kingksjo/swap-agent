# Miye Frontend

> This README will be depricated soon

A conversational AI-powered decentralized exchange (DEX) swap interface that allows users to perform token swaps through natural language interactions.

## 🚀 Overview

Miye is a React-based frontend application that provides an intelligent, conversational interface for cryptocurrency token swaps. Users can interact with an AI agent using natural language to get quotes, execute swaps, and learn about DeFi concepts.

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom dark theme
- **Icons**: Lucide React
- **Markdown**: React Markdown with GitHub Flavored Markdown support
- **Wallet Integration**: MetaMask & Trust Wallet via Ethereum provider

### Project Structure
```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # External service integrations
├── utils/              # Utility functions and services
├── data/               # Static data and configurations
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary Background**: `#0D0D0D`
- **Secondary Background**: `#1A1A1A`
- **Accent Color**: `#F97316` (Orange)
- **Primary Text**: `#FFFFFF`
- **Secondary Text**: `#E5E7EB`

### Typography
- **Font Family**: Inter (sans-serif)
- **Responsive sizing**: Using Tailwind's text utilities

## 📁 Key Components

### Core Components

#### `App.tsx`
- Main application container
- Manages global state (messages, quotes, processing state)
- Handles agent communication and swap execution
- Implements dual layout: LandingPage vs Chat interface

#### `LandingPage.tsx`
- Initial user interface with centered content
- Features conversation input and suggestion buttons
- Responsive layout with proper vertical centering

#### `ConversationalInput.tsx`
- Text input for user queries
- Send button with conditional visibility
- Accessible keyboard navigation

#### `UnifiedMessage.tsx`
- Displays chat messages with different styles for user/assistant/system
- Markdown rendering for rich text content
- Avatar display for assistant messages

#### `SwapCard.tsx`
- Interactive swap interface showing quote details
- Token selection and amount inputs
- Route information and execution button

#### `Header.tsx`
- Application header with branding
- Wallet connection interface with dropdown menu
- Account management (balance, address, disconnect)

### Utility Components

#### `SuggestionButton.tsx`
- Reusable button for quick actions
- Hover effects with orange glow
- Consistent sizing and styling

## 🔧 Services & Utilities

### Agent Communication (`lib/agentClient.ts`)
```typescript
sendToAgent(input: string, sessionId: string, ctx?: any)
confirmAction(actionId: string, confirm: boolean)
```
- Handles communication with the AI agent backend
- Manages session state and context
- Processes different message types (text, quotes, confirmations)

### Wallet Management (`hooks/useWallet.ts`)
```typescript
const { wallet, isConnecting, connect, disconnect, switchNetwork } = useWallet();
```
- MetaMask and Trust Wallet integration
- Account and network management
- Event handling for account/network changes

### Swap Service (`utils/swapService.ts`)
- Mock swap quote generation
- Token price calculations
- Route optimization simulation
- Gas estimation

### NLP Processing (`utils/nlpProcessor.ts`)
- Natural language command parsing
- Token and amount extraction
- Educational response generation

## 📊 Data Models

### Key Types

#### `Token`
```typescript
interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  verified: boolean;
  riskScore?: 'LOW' | 'MEDIUM' | 'HIGH';
  liquidityUSD?: number;
}
```

#### `SwapQuote`
```typescript
interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  gasEstimate: string;
  route: SwapRoute[];
  slippage: number;
  estimatedGasUSD: number;
}
```

#### `ChatMessage`
```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    quote?: SwapQuote;
    transaction?: TransactionData;
    educationalContent?: EducationalContent;
  };
}
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or Trust Wallet browser extension

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swap-agent/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_AGENT_URL=http://localhost:8000
   VITE_AGENT_KEY=your-agent-api-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔌 Integration

### Agent Backend Integration
The frontend communicates with an AI agent backend through REST APIs:

- **Chat Endpoint**: `POST /chat`
  ```json
  {
    "message": "Swap 1 ETH for USDC",
    "session_id": "uuid",
    "context": { "recipient": "0x...", "defaults": {...} }
  }
  ```

- **Confirmation Endpoint**: `POST /confirm`
  ```json
  {
    "action_id": "uuid",
    "confirm": true
  }
  ```

### Wallet Integration
Supports multiple wallet types through the Ethereum provider:
- MetaMask
- Trust Wallet
- WalletConnect (extensible)

## 🎯 Features

### Conversational Interface
- Natural language swap commands
- Context-aware responses
- Educational content generation
- Session management

### Swap Functionality
- Multi-DEX route optimization
- Real-time quote updates
- Price impact warnings
- Gas estimation
- Transaction confirmation

### User Experience
- Dark theme optimized for crypto users
- Responsive design for mobile/desktop
- Accessible keyboard navigation
- Loading states and error handling

### Safety Features
- Token verification warnings
- Price impact alerts
- Slippage protection
- Transaction confirmation prompts

## 🧪 Development

### Code Style
- TypeScript strict mode enabled
- ESLint configuration with React hooks rules
- Consistent component patterns
- Proper error boundaries

### Component Guidelines
1. **Functional Components**: Use React.FC with explicit prop types
2. **Hooks**: Extract complex logic into custom hooks
3. **Styling**: Use Tailwind CSS classes consistently
4. **Accessibility**: Include proper ARIA labels and keyboard support

### State Management
- Local state with useState for component-specific data
- Custom hooks for shared logic (wallet, agent communication)
- Context avoided for simplicity in this scope

### Testing Strategy
- Unit tests for utility functions
- Integration tests for critical user flows
- E2E tests for wallet connection and swap execution

## 🔒 Security Considerations

### Frontend Security
- No private key handling (wallet-managed)
- Input validation for all user data
- XSS protection through React's built-in sanitization
- HTTPS required for production

### Smart Contract Interaction
- All transactions go through connected wallet
- User confirmation required for all operations
- Gas estimation and limits enforced

## 📱 Browser Support

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Extensions
- MetaMask or Trust Wallet
- JavaScript enabled
- LocalStorage available

## 🚀 Deployment

### Build Process
```bash
npm run build
```
Generates optimized static files in `dist/` directory.

### Environment Variables
- `VITE_AGENT_URL` - Backend agent API URL
- `VITE_AGENT_KEY` - API authentication key (optional)

### Static Hosting
Compatible with:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Deploying with the Vercel CLI (monorepo friendly)

If Vercel's web UI doesn't detect the `frontend` folder automatically, use the Vercel CLI to deploy directly from the subfolder.

PowerShell commands (copy/paste):

```powershell
# Install Vercel CLI (global)
npm i -g vercel

# Login (opens browser)
vercel login

# Deploy interactively from the frontend folder
cd frontend
vercel --prod

# Or non-interactive / CI-style deploy from repo root
vercel --prod --cwd frontend --confirm
```

Vercel settings when using the web UI:
- Root Directory: `frontend` (you can type it manually)
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variables:
- Add `VITE_AGENT_URL` and any other `VITE_` variables via the Vercel Dashboard (Project → Settings → Environment Variables). These are inlined at build-time.

Using the serverless proxy (`/api/chat`):
- We added `frontend/api/chat.js` as a small proxy function that forwards POST /api/chat to the private agent using server-side env vars `AGENT_INTERNAL_URL` and `AGENT_INTERNAL_KEY`.
- Set `AGENT_INTERNAL_URL` and `AGENT_INTERNAL_KEY` in Vercel Dashboard (they are not exposed to the client).
- Change your client `VITE_AGENT_URL` to `/api/chat` if you want the frontend to call the proxy.


## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes following the code style
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Follow existing TypeScript patterns
- Use meaningful component and variable names
- Add JSDoc comments for complex functions
- Maintain responsive design principles

### Pull Request Guidelines
- Include clear description of changes
- Add screenshots for UI changes
- Ensure no linting errors
- Test on multiple browsers/devices

## 📚 Additional Resources

### Dependencies Documentation
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Lucide React](https://lucide.dev/)

### Web3 Integration
- [MetaMask Documentation](https://docs.metamask.io/)
- [Ethereum Provider API](https://docs.metamask.io/wallet/reference/provider-api/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**Wallet Connection Issues**
- Ensure MetaMask/Trust Wallet is installed and unlocked
- Check network compatibility
- Verify site permissions in wallet settings

**Build Issues**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Verify Node.js version compatibility
- Check for conflicting global packages

**Styling Issues**
- Ensure Tailwind CSS is properly configured
- Check for CSS purging in production builds
- Verify custom color definitions in `tailwind.config.js`

### Support
For technical issues and feature requests, please open an issue in the repository.
