import { useState, useEffect } from 'react';
import { WalletConnection } from '../types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletConnection>({
    isConnected: false
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (window.ethereum && (window.ethereum.isMetaMask || window.ethereum.isTrust)) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum && (window.ethereum.isMetaMask || window.ethereum.isTrust)) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum || !(window.ethereum.isMetaMask || window.ethereum.isTrust)) return;

    console.log('Checking wallet connection...');

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log('eth_accounts result:', accounts);

      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });

        setWallet({
          isConnected: true,
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          balance: (parseInt(balance, 16) / 1e18).toFixed(4)
        });
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connect = async () => {
    if (!window.ethereum || !(window.ethereum.isMetaMask || window.ethereum.isTrust)) {
      alert('Please install MetaMask or Trust Wallet to use this feature.');
      return false;
    }

    console.log('Connecting with wallet...');

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      console.log('eth_requestAccounts result:', accounts);

      if (accounts.length > 0) {
        await checkConnection();
        return true;
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }

    return false;
  };

  const disconnect = () => {
    setWallet({ isConnected: false });
  };

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to wallet
        console.error('Network not added to wallet');
      }
      return false;
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      checkConnection();
    }
  };

  const handleChainChanged = () => {
    checkConnection();
  };

  return {
    wallet,
    isConnecting,
    connect,
    disconnect,
    switchNetwork
  };
};