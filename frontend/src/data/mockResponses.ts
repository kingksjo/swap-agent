import { AgentMessage } from "../lib/agentClient";

/**
 * Mock AI responses for testing and UI development without backend
 */

export const MOCK_RESPONSES: Record<string, AgentMessage[]> = {
  // Greeting responses
  hello: [
    {
      type: "assistant_text",
      text: "👋 Hello! I'm your AI swap assistant. I can help you swap tokens across different networks. Try asking me something like 'swap 1 ETH to USDC' or 'what's the best rate for DAI to USDC?'",
    },
  ],
  hi: [
    {
      type: "assistant_text",
      text: "Hi there! 🚀 Ready to help you with token swaps. What would you like to swap today?",
    },
  ],

  // Swap quote examples
  "swap 1 eth to usdc": [
    {
      type: "assistant_text",
      text: "I'll find you the best rate to swap 1 ETH to USDC. Let me check the current market...",
    },
    {
      type: "swap_quote",
      data: {
        fromToken: "ETH",
        toToken: "USDC",
        inputAmount: "1",
        estimatedOutput: "3245.50",
        priceImpact: "0.12%",
        gasEstimate: "0.0035",
        route: ["Uniswap V3", "1inch"],
        slippage_bps: 50,
      },
    },
    {
      type: "confirmation_request",
      action_id: "mock_action_123",
    },
  ],

  "swap 100 usdc to dai": [
    {
      type: "assistant_text",
      text: "Looking for the best route to swap 100 USDC to DAI...",
    },
    {
      type: "swap_quote",
      data: {
        fromToken: "USDC",
        toToken: "DAI",
        inputAmount: "100",
        estimatedOutput: "99.85",
        priceImpact: "0.02%",
        gasEstimate: "0.002",
        route: ["Curve"],
        slippage_bps: 50,
      },
    },
    {
      type: "confirmation_request",
      action_id: "mock_action_456",
    },
  ],

  "swap 0.5 eth to uni": [
    {
      type: "assistant_text",
      text: "Finding the optimal path for swapping 0.5 ETH to UNI...",
    },
    {
      type: "swap_quote",
      data: {
        fromToken: "ETH",
        toToken: "UNI",
        inputAmount: "0.5",
        estimatedOutput: "245.75",
        priceImpact: "0.35%",
        gasEstimate: "0.0042",
        route: ["Uniswap V3"],
        slippage_bps: 50,
      },
    },
    {
      type: "confirmation_request",
      action_id: "mock_action_789",
    },
  ],

  // Educational/help responses
  "what is slippage": [
    {
      type: "assistant_text",
      text: "📚 **Slippage** is the difference between the expected price of a trade and the actual price at which it executes.\n\nFor example, if you're swapping ETH for USDC and expect to get 3000 USDC, but the price moves and you only get 2985 USDC, that 15 USDC difference is slippage.\n\n**Slippage tolerance** is the maximum percentage difference you're willing to accept. A 0.5% slippage tolerance means you'll accept up to 0.5% less than the quoted amount.\n\n💡 **Tip**: Higher slippage tolerance = faster execution but potentially worse price. Lower tolerance = better price protection but risk of transaction failure.",
    },
  ],

  "what is gas": [
    {
      type: "assistant_text",
      text: "⛽ **Gas** is the fee you pay to execute transactions on the blockchain.\n\nThink of it like paying for fuel to power your transaction. The more complex the transaction (like swapping through multiple DEXs), the more gas it requires.\n\n**Gas is paid in the native token** of the blockchain:\n- Ethereum: ETH\n- Polygon: MATIC\n- BSC: BNB\n\n💡 **Tip**: Gas prices fluctuate based on network congestion. Try swapping during off-peak hours for lower fees!",
    },
  ],

  help: [
    {
      type: "assistant_text",
      text: "🤖 **Here's what I can help you with:**\n\n**Swap Tokens:**\n- 'swap 1 ETH to USDC'\n- 'convert 100 DAI to USDC'\n- 'exchange 0.5 ETH for UNI'\n\n**Get Information:**\n- 'what is slippage?'\n- 'what is gas?'\n- 'explain price impact'\n- 'what are the best rates for ETH?'\n\n**Check Prices:**\n- 'what's the current price of ETH?'\n- 'compare rates for USDC to DAI'\n\nJust ask naturally, and I'll understand! 🚀",
    },
  ],

  "what is price impact": [
    {
      type: "assistant_text",
      text: "📊 **Price Impact** is how much your trade affects the token's price in the liquidity pool.\n\nWhen you swap tokens, you're trading against a liquidity pool. Large trades relative to the pool size can significantly shift the price.\n\n**Example:**\nIf a pool has 100 ETH and 300,000 USDC:\n- Swapping 1 ETH → Low price impact (~1%)\n- Swapping 10 ETH → High price impact (~10%+)\n\n💡 **Tip**: Lower price impact = better deal. If impact is high (>3%), consider:\n1. Splitting into smaller trades\n2. Using a different DEX with deeper liquidity\n3. Waiting for better market conditions",
    },
  ],

  // Price check responses
  "price of eth": [
    {
      type: "assistant_text",
      text: "💰 **Current ETH Price:**\n\n- **$3,245.50** USDC\n- 24h Change: +2.3% 📈\n- 24h High: $3,289.00\n- 24h Low: $3,156.00\n\nWould you like to swap some ETH?",
    },
  ],

  // Default fallback
  default: [
    {
      type: "assistant_text",
      text: "I understand you want to make a swap! Could you please specify:\n\n1. **Amount** - How much do you want to swap?\n2. **From Token** - What token are you swapping from? (e.g., ETH, USDC, DAI)\n3. **To Token** - What token do you want to receive?\n\nFor example: 'swap 1 ETH to USDC' or 'convert 100 DAI to USDC'",
    },
  ],
};

/**
 * Mock confirmation response for swap execution
 */
export const MOCK_CONFIRMATION_RESPONSE: AgentMessage[] = [
  {
    type: "assistant_text",
    text: "⏳ Executing your swap... Please wait while I submit the transaction to the blockchain.",
  },
  {
    type: "swap_result",
    data: {
      tx_hash: "0x" + Math.random().toString(16).substring(2, 66),
      status: "success",
      fromAmount: "1",
      toAmount: "3245.50",
      gasUsed: "0.0035",
    },
  },
];

/**
 * Find the best matching mock response for a given user input
 */
export function getMockResponse(userInput: string): AgentMessage[] {
  const input = userInput.toLowerCase().trim();

  // Check for exact or partial matches
  for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
    if (input.includes(key)) {
      return response;
    }
  }

  // Return default response if no match found
  return MOCK_RESPONSES["default"];
}
