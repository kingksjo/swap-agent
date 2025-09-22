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
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;

    console.log('Checking connection...');
    console.log('window.ethereum.isMetaMask:', window.ethereum.isMetaMask);

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
    if (!window.ethereum || !window.ethereum.isMetaMask || window.ethereum.isTrust) {
      alert('Please use the MetaMask extension and disable other wallet extensions.');
      return false;
    }

    console.log('Connecting...');
    console.log('window.ethereum.isMetaMask:', window.ethereum.isMetaMask);

    console.log('window.ethereum object:', window.ethereum);

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ 
        method: 'wallet_requestPermissions', 
        params: [{ eth_accounts: {} }]
      });
      console.log('eth_requestAccounts result:', accounts);
      
      if (accounts.length > 0) {
        await checkConnection();
        return true;
      }
    } catch (error: any) {
      if (error.code === -32603) {
        alert('No active wallet found. Please unlock your wallet and connect an account.');
      } else {
        console.error('Error connecting wallet:', error);
      }
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