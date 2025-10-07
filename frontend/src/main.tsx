import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {config, chains } from './lib/config.ts';

const queryClient = new QueryClient;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains} theme={darkTheme()} >
         <App />
         </RainbowKitProvider>
      </QueryClientProvider>
    
    </WagmiConfig>
  </StrictMode>
);
