import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base, sepolia } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WC_PROJECT_ID as string;
if (!projectId) throw new Error('VITE_WC_PROJECT_ID is not set');

export const chains = [mainnet, base, sepolia] as const;

export const config = getDefaultConfig({
  appName: 'MIYE Swap Agent',
  projectId,
  chains,
  ssr: false,
});
