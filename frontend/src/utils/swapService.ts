import { Token, SwapQuote, SwapRoute } from '../types';
import { DEX_PROTOCOLS } from '../data/tokens';

export class SwapService {
  async getQuote(
    fromToken: Token,
    toToken: Token,
    amount: number,
    slippage: number = 0.5
  ): Promise<SwapQuote> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock price calculation
    const mockPrice = this.calculateMockPrice(fromToken, toToken);
    const toAmount = (amount * mockPrice).toFixed(6);
    
    // Generate mock routes
    const routes = this.generateMockRoutes();
    
    // Calculate price impact based on amount
    const priceImpact = Math.min(amount * 0.001 + Math.random() * 0.5, 5);
    
    // Estimate gas
    const gasEstimate = (50000 + routes.length * 25000).toString();
    const gasPrice = 20; // gwei
    const ethPrice = 2000; // USD
    const estimatedGasUSD = (parseInt(gasEstimate) * gasPrice * ethPrice) / 1e18;

    return {
      fromToken,
      toToken,
      fromAmount: amount.toString(),
      toAmount,
      priceImpact,
      gasEstimate,
      route: routes,
      slippage,
      estimatedGasUSD
    };
  }

  private calculateMockPrice(fromToken: Token, toToken: Token): number {
    // Mock exchange rates (simplified)
    const rates: Record<string, number> = {
      'ETH-USDC': 2000,
      'ETH-DAI': 2000,
      'ETH-UNI': 200,
      'USDC-DAI': 1,
      'USDC-ETH': 0.0005,
      'DAI-ETH': 0.0005,
      'UNI-ETH': 0.005,
      'MATIC-USDC': 0.8
    };

    const key = `${fromToken.symbol}-${toToken.symbol}`;
    const reverseKey = `${toToken.symbol}-${fromToken.symbol}`;
    
    if (rates[key]) return rates[key];
    if (rates[reverseKey]) return 1 / rates[reverseKey];
    
    // Fallback random rate
    return Math.random() * 100 + 1;
  }

  private generateMockRoutes(): SwapRoute[] {
    const availableProtocols = DEX_PROTOCOLS.slice();
    const numRoutes = Math.floor(Math.random() * 3) + 1;
    const routes: SwapRoute[] = [];
    
    let remainingPercentage = 100;
    
    for (let i = 0; i < numRoutes; i++) {
      const protocolIndex = Math.floor(Math.random() * availableProtocols.length);
      const protocol = availableProtocols.splice(protocolIndex, 1)[0];
      
      const percentage = i === numRoutes - 1 
        ? remainingPercentage 
        : Math.floor(Math.random() * (remainingPercentage - 10)) + 10;
      
      remainingPercentage -= percentage;
      
      routes.push({
        dex: protocol.name,
        percentage,
        gasEstimate: (25000 + Math.floor(Math.random() * 15000)).toString()
      });
    }
    
    return routes.sort((a, b) => b.percentage - a.percentage);
  }

  async executeSwap(quote: SwapQuote): Promise<{ hash: string; status: 'pending' }> {
    // Simulate transaction submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    return {
      hash: mockHash,
      status: 'pending'
    };
  }

  checkTokenSafety(token: Token): {
    isVerified: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    if (!token.verified) {
      warnings.push('Token is not verified on major token lists');
    }
    
    if (token.liquidityUSD && token.liquidityUSD < 100000) {
      warnings.push('Low liquidity - high slippage risk');
    }
    
    if (token.riskScore === 'HIGH') {
      warnings.push('High risk token - proceed with caution');
    }
    
    return {
      isVerified: token.verified,
      riskLevel: token.riskScore || 'MEDIUM',
      warnings
    };
  }
}