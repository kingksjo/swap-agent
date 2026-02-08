import React from 'react';
import { ArrowDown, Settings, Info, Send } from 'lucide-react';
import { TransactionProposal, SwapProposal, SendProposal } from '../types';

interface Props {
  proposal: TransactionProposal;
  onExecuteSwap?: () => void;
}

export const SwapCard: React.FC<Props> = ({ proposal, onExecuteSwap }) => {
  const isSwap = proposal.action === 'swap';
  const isSend = proposal.action === 'send';

  // Render Swap Card
  if (isSwap) {
    const swap = proposal as SwapProposal;
    
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
              <button className="text-white font-medium px-4 py-2 rounded-xl bg-[#2A2A2A]">
                Swap
              </button>
              <button className="text-gray-400 hover:text-white font-medium px-4 py-2 rounded-xl hover:bg-[#2A2A2A] transition-colors">
                Limit
              </button>
            </div>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* From Token */}
          <div className="space-y-4">
            <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Sell</span>
                <span className="text-gray-400 text-sm">Balance: 0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={swap.amount}
                  readOnly
                  className="bg-transparent text-white text-3xl font-medium focus:outline-none w-full"
                />
                <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-xl px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {swap.tokenIn.substring(0, 1)}
                  </div>
                  <span className="text-white font-medium">{swap.tokenIn}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-2 font-mono">
                {swap.tokenInAddress.substring(0, 6)}...{swap.tokenInAddress.substring(38)}
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center">
              <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-2">
                <ArrowDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* To Token */}
            <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Buy</span>
                <span className="text-gray-400 text-sm">Balance: 0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={swap.estimatedOutput}
                  readOnly
                  className="bg-transparent text-white text-3xl font-medium focus:outline-none w-full"
                />
                <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-xl px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {swap.tokenOut.substring(0, 1)}
                  </div>
                  <span className="text-white font-medium">{swap.tokenOut}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-2 font-mono">
                {swap.tokenOutAddress.substring(0, 6)}...{swap.tokenOutAddress.substring(38)}
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="mt-6 p-4 bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Transaction Details</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Max Slippage</span>
                <span className="text-gray-300">{swap.maxSlippage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Chain</span>
                <span className="text-gray-300 capitalize">{swap.chain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Router</span>
                <span className="text-gray-300 font-mono text-xs">
                  {swap.routerAddress.substring(0, 6)}...{swap.routerAddress.substring(38)}
                </span>
              </div>
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={() => onExecuteSwap?.()}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 rounded-2xl font-medium text-lg mt-6 transition-all duration-200"
          >
            Execute Swap
          </button>
        </div>
      </div>
    );
  }

  // Render Send Card
  if (isSend) {
    const send = proposal as SendProposal;
    
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium text-lg">Send Tokens</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Token Amount */}
          <div className="space-y-4">
            <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Amount</span>
                <span className="text-gray-400 text-sm">Balance: 0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={send.amount}
                  readOnly
                  className="bg-transparent text-white text-3xl font-medium focus:outline-none w-full"
                />
                <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-xl px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {send.token.substring(0, 1)}
                  </div>
                  <span className="text-white font-medium">{send.token}</span>
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-2 font-mono">
                {send.tokenAddress.substring(0, 6)}...{send.tokenAddress.substring(38)}
              </div>
            </div>

            {/* Recipient Address */}
            <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Recipient</span>
              </div>
              <div className="text-white text-lg font-mono break-all">
                {send.toAddress}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mt-6 p-4 bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Transaction Details</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Chain</span>
                <span className="text-gray-300 capitalize">{send.chain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Token</span>
                <span className="text-gray-300">{send.token}</span>
              </div>
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={() => onExecuteSwap?.()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-2xl font-medium text-lg mt-6 transition-all duration-200"
          >
            Send Tokens
          </button>
        </div>
      </div>
    );
  }

  return null;
};