import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect, reset } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close wallet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close wallet menu and reset disconnect state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setShowWalletMenu(false);
      reset();
    }
  }, [isConnected, reset]);

  const copyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      setShowWalletMenu(false);
    }
  }, [address]);

  const handleDisconnect = useCallback(() => {
    setShowWalletMenu(false);
    disconnect();
  }, [disconnect]);

  return (
    <div className="px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/miye.svg" alt="Miye" className="w-8" />
        </div>

        <div className="flex items-center gap-4">
          {!isConnected ? (
            <button
              onClick={() => openConnectModal?.()}
              className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
                <ChevronDown className="w-3 h-3" />
              </button>

              {showWalletMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-[#2A2A2A]">
                    <div className="text-white font-medium mb-1">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Balance: {balance?.formatted
                        ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                        : '—'}
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
                        window.open(`https://etherscan.io/address/${address}`, '_blank');
                        setShowWalletMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Explorer
                    </button>

                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
