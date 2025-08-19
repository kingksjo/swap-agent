import React, { useState, useRef, useEffect } from 'react';
import { Zap, Settings, Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const Header: React.FC = () => {
  const { wallet, isConnecting, connect, disconnect } = useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setShowWalletMenu(false); // Close menu after copying
    }
  };

  const WalletButton = () => {
    if (!wallet.isConnected) {
      return (
        <button
          onClick={connect}
          disabled={isConnecting}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      );
    }

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowWalletMenu(!showWalletMenu)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
          <ChevronDown className="w-3 h-3" />
        </button>

        {showWalletMenu && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-xl z-50">
            <div className="p-4 border-b border-[#2A2A2A]">
              <div className="text-white font-medium mb-1">
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </div>
              <div className="text-gray-400 text-sm">
                Balance: {wallet.balance} ETH
              </div>
            </div>
            
            <div className="p-2">
              <button
                onClick={copyAddress}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </button>
              
              <button
                onClick={() => {
                  window.open(`https://etherscan.io/address/${wallet.address}`, '_blank');
                  setShowWalletMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </button>
              
              <button
                onClick={() => {
                  disconnect();
                  setShowWalletMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#0D0D0D] border-b border-[#1A1A1A] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-semibold">SwapAI</span>
          </div>
          
          <nav className="flex items-center gap-1">
            <button className="text-white font-medium px-4 py-2 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
              Trade
            </button>
            <button className="text-gray-400 hover:text-white font-medium px-4 py-2 rounded-xl hover:bg-[#1A1A1A] transition-colors">
              Explore
            </button>
            <button className="text-gray-400 hover:text-white font-medium px-4 py-2 rounded-xl hover:bg-[#1A1A1A] transition-colors">
              Pool
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tokens and pools"
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-4 py-2 pl-10 text-white placeholder-gray-400 w-80 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
          </div>
          
          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          <WalletButton />
        </div>
      </div>
    </div>
  );
};