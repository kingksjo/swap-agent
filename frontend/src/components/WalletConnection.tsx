import React, { useState } from 'react';
import { Wallet, AlertCircle, ChevronDown } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { SUPPORTED_NETWORKS } from '../data/tokens';

export const WalletConnection: React.FC = () => {
  const { wallet, isConnecting, providers, connect, disconnect, switchNetwork } = useWallet();
  const [showWallets, setShowWallets] = useState(false);

  const currentNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === wallet.chainId);

  const handleConnectClick = (provider: any) => {
    if (provider) {
      connect(provider);
    } else if (providers.length === 1) {
      connect(providers[0]);
    } else {
      setShowWallets(true);
    }
  };

  if (!wallet.isConnected) {
    if (showWallets) {
      return (
        <div className="w-full max-w-md mx-auto px-4 mb-12">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-8 text-center">
            <h3 className="text-white text-xl font-semibold mb-3">Select a Wallet</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {providers.map((provider: any) => (
                <button
                  key={provider.info.uuid}
                  onClick={() => connect(provider)}
                  className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                >
                  <img src={provider.info.icon} alt={provider.info.name} className="w-6 h-6 mr-2" />
                  {provider.info.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md mx-auto px-4 mb-12">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-pink-400" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-3">Connect Wallet</h3>
          <p className="text-gray-400 mb-8 leading-relaxed">Connect your wallet to start trading with AI assistance</p>
          <button
            onClick={() => handleConnectClick(providers[0])}
            disabled={isConnecting}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-8">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </span>
                {currentNetwork && (
                  <span className="bg-[#2A2A2A] text-gray-300 px-2 py-1 rounded-lg text-xs">
                    {currentNetwork.name}
                  </span>
                )}
              </div>
              <div className="text-gray-400 text-sm">
                Balance: {wallet.balance} ETH
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!currentNetwork && (
              <div className="flex items-center gap-2 text-orange-400 bg-orange-500/10 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Unsupported Network</span>
              </div>
            )}
            
            <button className="flex items-center gap-2 text-gray-400 hover:text-white bg-[#2A2A2A] hover:bg-[#3A3A3A] px-3 py-2 rounded-lg transition-colors">
              <span className="text-sm">Options</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};