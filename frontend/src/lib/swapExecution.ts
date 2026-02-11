import { type Address, parseEther, parseUnits, encodeFunctionData } from 'viem';
import { type Config } from 'wagmi';
import { sendTransaction, waitForTransactionReceipt } from 'wagmi/actions';

// Base network WETH address (required for ETH swaps on Uniswap V3)
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as Address;

// Uniswap V3 SwapRouter02 exactInputSingle ABI (no deadline in struct, unlike original SwapRouter)
const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// ERC20 approve ABI (needed for non-ETH token swaps)
const ERC20_APPROVE_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export interface SwapParams {
  tokenIn: string;
  tokenInAddress: string;
  tokenOut: string;
  tokenOutAddress: string;
  amount: string;
  estimatedOutput: string;
  maxSlippage: string;
  routerAddress: string;
  chain: string;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Map backend chain identifier to numeric chain ID
 */
function getChainId(chain: string): number {
  switch (chain.toLowerCase()) {
    case 'base_sepolia': return 84532;
    case 'base': return 8453;
    default: return 8453;
  }
}

/**
 * Execute a token swap on-chain using the Uniswap V3 Router.
 * This mirrors the logic in test_swap.py but uses wagmi/viem for browser wallet signing.
 */
export async function executeSwap(
  config: Config,
  params: SwapParams,
  userAddress: Address
): Promise<SwapResult> {
  try {
    const isETHInput = params.tokenIn.toUpperCase() === 'ETH';
    const chainId = getChainId(params.chain);

    console.log(`🔗 Target chain: ${params.chain} (${chainId})`);

    // Uniswap V3 requires WETH address, not the zero address
    const tokenIn: Address = isETHInput
      ? WETH_ADDRESS
      : (params.tokenInAddress as Address);
    const tokenOut: Address = params.tokenOutAddress as Address;
    const routerAddress: Address = params.routerAddress as Address;

    // Parse the input amount into wei
    // ETH uses 18 decimals; for other tokens we'd need to know the decimals
    const amountInWei = isETHInput
      ? parseEther(params.amount)
      : parseUnits(params.amount, 18); // TODO: look up token decimals dynamically

    // Calculate minimum output based on slippage
    // estimatedOutput is in the output token's denomination
    const slippagePct = parseFloat(params.maxSlippage) / 100;
    const estimatedOut = parseFloat(params.estimatedOutput);
    const minOutput = estimatedOut * (1 - slippagePct);

    // USDC has 6 decimals, most other tokens have 18
    const outDecimals = params.tokenOut.toUpperCase() === 'USDC' ? 6 : 18;

    // On testnet, pool prices don't match mainnet CoinGecko prices,
    // so we set amountOutMinimum to 0 to avoid reverts.
    // On mainnet, use the slippage-adjusted estimate.
    const isTestnet = params.chain.toLowerCase().includes('sepolia');
    const amountOutMinimum = isTestnet
      ? 0n
      : parseUnits(minOutput.toFixed(outDecimals), outDecimals);

    if (isTestnet) {
      console.log('⚠️ Testnet mode: amountOutMinimum set to 0 (pool prices differ from mainnet)');
    }

    // If input is NOT ETH, we need to approve the router to spend our tokens first
    if (!isETHInput) {
      console.log('📝 Approving token spend...');
      const approveData = encodeFunctionData({
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [routerAddress, amountInWei],
      });

      const approveTxHash = await sendTransaction(config, {
        chainId,
        to: tokenIn,
        data: approveData,
      });

      console.log(`✅ Approval tx: ${approveTxHash}`);

      // Wait for approval to be mined
      await waitForTransactionReceipt(config, { hash: approveTxHash });
      console.log('✅ Approval confirmed');
    }

    // Build the exactInputSingle call data
    const swapData = encodeFunctionData({
      abi: SWAP_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [
        {
          tokenIn,
          tokenOut,
          fee: 3000, // 0.3% pool fee (standard)
          recipient: userAddress,
          amountIn: amountInWei,
          amountOutMinimum,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    console.log('📝 Sending swap transaction...');
    console.log('Swap params:', {
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      fee: 3000,
      recipient: userAddress,
      amountIn: amountInWei.toString(),
      amountOutMinimum: amountOutMinimum.toString(),
      value: isETHInput ? amountInWei.toString() : '0',
      chainId,
    });

    // Send the swap transaction
    const txHash = await sendTransaction(config, {
      chainId,
      to: routerAddress,
      data: swapData,
      value: isETHInput ? amountInWei : 0n, // Send ETH value only if swapping ETH
    });

    console.log(`🚀 Swap tx sent: ${txHash}`);

    // Wait for confirmation
    const receipt = await waitForTransactionReceipt(config, { hash: txHash });

    if (receipt.status === 'success') {
      console.log(`✅ Swap confirmed in block ${receipt.blockNumber}`);
      return { success: true, txHash };
    } else {
      return { success: false, txHash, error: 'Transaction reverted on-chain' };
    }
  } catch (error: unknown) {
    console.error('❌ Swap execution error:', error);

    // Handle user rejection
    if (error instanceof Error && error.message.includes('User rejected')) {
      return { success: false, error: 'Transaction rejected by user' };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during swap execution',
    };
  }
}

/**
 * Get the block explorer URL for a transaction hash
 */
export function getExplorerUrl(txHash: string, chain: string = 'base'): string {
  if (chain.toLowerCase().includes('sepolia')) {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  }
  return `https://basescan.org/tx/${txHash}`;
}
