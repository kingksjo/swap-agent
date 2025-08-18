import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('8080'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_KEYS: z.string().default('local-dev-key-1,hackathon-demo-key'),
  
  // StarkNet Configuration
  NETWORK: z.enum(['mainnet', 'sepolia']).default('sepolia'),
  STARKNET_RPC: z.string().default('https://starknet-sepolia.public.blastapi.io/rpc/v0_9'),
  
  // Mock values for development (replace when real contracts available)
  SERVER_ACCOUNT_ADDRESS: z.string().default('0x1234567890abcdef'),
  SERVER_PRIVATE_KEY: z.string().default('0x1234567890abcdef'),
  AUTOSWAPPR_ADDRESS: z.string().default('0x04deb7a3d89e7a4a7a03df748de45d81b2dc418f446b9cc837c5cbd8897895c9'),
  
  // Swap Configuration
  DEFAULT_SLIPPAGE_BPS: z.string().default('50'),
  TX_DEADLINE_SECS: z.string().default('600'),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

export default env;
