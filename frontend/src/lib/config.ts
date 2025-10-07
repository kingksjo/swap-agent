import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  injectedWallet,
  rainbowWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, base, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const projectId = import.meta.env.VITE_WC_PROJECT_ID as string;
if (!projectId) throw new Error('VITE_WC_PROJECT_ID is not set');

const { chains, publicClient } = configureChains(
  [mainnet, base, sepolia],
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Popular Wallets',
    wallets: [
      metaMaskWallet({ projectId, chains }),
      injectedWallet({ chains }),
      coinbaseWallet({ appName: 'MIYE', chains }),
      walletConnectWallet({ projectId, chains }),
      rainbowWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
    ],
  },
]);

export const config = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
});

export { chains };
