import React from 'react';
import { ArrowDown, Send } from 'lucide-react';
import { TransactionProposal } from '../types';

interface Props {
  proposal: TransactionProposal;
  onExecute?: () => void;
}

export const SwapCard: React.FC<Props> = ({ proposal, onExecute }) => {
  const isSwap = proposal.action === 'swap';
  const isSend = proposal.action === 'send';

  if (isSwap) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
              <div className="text-white font-medium px-4 py-2 rounded-xl bg-[#2A2A2A]">
                Swap Proposal
              </div>
            </div>
          </div>

          {/* From Token */}
          <div className="space-y-4">
            <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Sell</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={proposal.amount}
                  readOnly
                  className="bg-transparent text-white text-3xl font-medium focus:outline-none w-full"
                />
                <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-xl px-3 py-2">
                  <span className="text-white font-medium">{proposal.tokenIn}</span>
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-1 truncate">
                {proposal.tokenInAddress}
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
                <span className="text-gray-400 text-sm">Buy (estimated)</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={proposal.estimatedOutput}
                  readOnly
                  className="bg-transparent text-white text-3xl font-medium focus:outline-none w-full"
                />
                <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-xl px-3 py-2">
                  <span className="text-white font-medium">{proposal.tokenOut}</span>
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-1 truncate">
                {proposal.tokenOutAddress}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mt-6 p-4 bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Max Slippage</span>
                <span className="text-gray-300">{proposal.maxSlippage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Chain</span>
                <span className="text-gray-300 capitalize">{proposal.chain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Router</span>
                <span className="text-gray-300 text-xs truncate max-w-[200px]">
                  {proposal.routerAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={() => onExecute?.()}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 rounded-2xl font-medium text-lg mt-6 transition-all duration-200"
          >
            Execute Swap
          </button>
        </div>
      </div>
    );
  }

  if (isSend) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" />
              <div className="text-white font-medium px-4 py-2 rounded-xl bg-[#2A2A2A]">
                Send Proposal
              </div>
            </div>
          </div>

          {/* Token Amount */}
          <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Amount</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={proposal.amount}
                readOnly
                className="bg-transparent text-white text-3xl font-medium focus:outline-none w-full"
              />
              <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-xl px-3 py-2">
                <span className="text-white font-medium">{proposal.token}</span>
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-1 truncate">
              {proposal.tokenAddress}
            </div>
          </div>

          {/* Recipient */}
          <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">To Address</span>
            </div>
            <div className="text-white text-sm font-mono break-all">
              {proposal.toAddress}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mt-6 p-4 bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Chain</span>
                <span className="text-gray-300 capitalize">{proposal.chain}</span>
              </div>
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={() => onExecute?.()}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 rounded-2xl font-medium text-lg mt-6 transition-all duration-200"
          >
            Execute Send
          </button>
        </div>
      </div>
    );
  }

  return null;
};