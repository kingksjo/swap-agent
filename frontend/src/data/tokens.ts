import { Token, Network } from '../types';

export const SUPPORTED_NETWORKS: Network[] = [
  {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    logoURI: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png'
  },
  {
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    logoURI: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png'
  },
  {
    chainId: 56,
    name: 'BSC',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
    logoURI: 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png'
  }
];

export const POPULAR_TOKENS: Token[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    chainId: 1,
    verified: true,
    riskScore: 'LOW',
    liquidityUSD: 2000000000,
    logoURI: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png'
  },
  {
    address: '0xA0b86a33E6441c8C673f36c0A4Ba4d7f0F01F2F7',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 1,
    verified: true,
    riskScore: 'LOW',
    liquidityUSD: 1500000000,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png'
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    chainId: 1,
    verified: true,
    riskScore: 'LOW',
    liquidityUSD: 800000000,
    logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/4943.png'
  },
  {
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
    chainId: 1,
    verified: true,
    riskScore: 'LOW',
    liquidityUSD: 400000000,
    logoURI: 'https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png'
  },
  {
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    chainId: 137,
    verified: true,
    riskScore: 'LOW',
    liquidityUSD: 300000000,
    logoURI: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png'
  }
];

export const DEX_PROTOCOLS = [
  { name: 'Uniswap V3', icon: '🦄', color: '#FF007A' },
  { name: 'SushiSwap', icon: '🍣', color: '#0E7EF4' },
  { name: '1inch', icon: '1️⃣', color: '#1A1A1A' },
  { name: 'PancakeSwap', icon: '🥞', color: '#D1884F' },
  { name: 'Curve', icon: '🌊', color: '#40E0D0' }
];