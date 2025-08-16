import { Token, SwapQuote } from '../types';
import { POPULAR_TOKENS } from '../data/tokens';

interface ParsedSwapCommand {
  action: 'swap' | 'buy' | 'sell';
  fromToken?: Token;
  toToken?: Token;
  amount?: number;
  slippage?: number;
  network?: number;
  urgency?: 'low' | 'medium' | 'high';
}

export class NLPProcessor {
  private tokenSymbols: Map<string, Token> = new Map();

  constructor() {
    // Build token symbol lookup
    POPULAR_TOKENS.forEach(token => {
      this.tokenSymbols.set(token.symbol.toLowerCase(), token);
      this.tokenSymbols.set(token.name.toLowerCase(), token);
    });
  }

  parseSwapCommand(input: string): ParsedSwapCommand | null {
    const lowerInput = input.toLowerCase();
    
    // Extract action
    let action: 'swap' | 'buy' | 'sell' = 'swap';
    if (lowerInput.includes('buy')) action = 'buy';
    else if (lowerInput.includes('sell')) action = 'sell';

    // Extract tokens
    const tokenMatches = this.extractTokens(input);
    let fromToken: Token | undefined;
    let toToken: Token | undefined;

    if (action === 'swap') {
      [fromToken, toToken] = tokenMatches;
    } else if (action === 'buy') {
      toToken = tokenMatches[0];
      fromToken = this.tokenSymbols.get('eth'); // Default to ETH
    } else if (action === 'sell') {
      fromToken = tokenMatches[0];
      toToken = this.tokenSymbols.get('usdc'); // Default to USDC
    }

    // Extract amount
    const amountRegex = /(\d+\.?\d*)\s*(eth|usdc|dai|uni|matic|btc)/i;
    const amountMatch = input.match(amountRegex);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined;

    // Extract slippage
    const slippageRegex = /(\d+\.?\d*)%?\s*slippage/i;
    const slippageMatch = input.match(slippageRegex);
    const slippage = slippageMatch ? parseFloat(slippageMatch[1]) : undefined;

    // Extract urgency/priority
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    if (lowerInput.includes('urgent') || lowerInput.includes('fast') || lowerInput.includes('quick')) {
      urgency = 'high';
    } else if (lowerInput.includes('cheap') || lowerInput.includes('lowest fee')) {
      urgency = 'low';
    }

    // Extract network
    let network: number | undefined;
    if (lowerInput.includes('polygon') || lowerInput.includes('matic')) network = 137;
    else if (lowerInput.includes('bsc') || lowerInput.includes('binance')) network = 56;
    else if (lowerInput.includes('ethereum') || lowerInput.includes('mainnet')) network = 1;

    return {
      action,
      fromToken,
      toToken,
      amount,
      slippage,
      network,
      urgency
    };
  }

  private extractTokens(input: string): Token[] {
    const tokens: Token[] = [];
    const words = input.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      const token = this.tokenSymbols.get(cleanWord);
      if (token && !tokens.find(t => t.symbol === token.symbol)) {
        tokens.push(token);
      }
    }

    return tokens;
  }

  generateEducationalResponse(quote: SwapQuote): string {
    const priceImpactWarning = quote.priceImpact > 1 
      ? " ⚠️ This trade has high price impact - you're moving the market price significantly."
      : "";

    const gasExplanation = quote.estimatedGasUSD > 50
      ? " Gas fees are high due to network congestion."
      : " Gas fees are reasonable right now.";

    return `Here's what's happening with your swap:

📊 **Price Impact**: ${quote.priceImpact.toFixed(2)}% - This is how much your trade affects the token price.${priceImpactWarning}

⛽ **Gas Fees**: ~$${quote.estimatedGasUSD.toFixed(2)}${gasExplanation}

🔀 **Route**: Your swap will be split across ${quote.route.length} DEX(es) for the best price:
${quote.route.map(r => `• ${r.dex}: ${r.percentage}%`).join('\n')}

💧 **Slippage**: ${quote.slippage}% tolerance means you'll accept up to ${quote.slippage}% price movement during execution.`;
  }
}