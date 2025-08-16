import React from 'react';
import { ArrowDown, Settings, Info } from 'lucide-react';
import { SwapQuote } from '../types';

interface Props {
  quote?: SwapQuote;
  onExecuteSwap?: (quote: SwapQuote) => void;
}

export const SwapCard: React.FC<Props> = ({ quote, onExecuteSwap }) => {
  if (!quote) return null;

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
                value={parseFloat(quote.fromAmount).toFixed(4)}
                readOnly
                className="bg-transparent text-white text-3xl font-medium focus:outline-none w-full"
              />
              <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-xl px-3 py-2">
                <img 
                  src={quote.fromToken.logoURI} 
                  alt={quote.fromToken.symbol}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white font-medium">{quote.fromToken.symbol}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
            <div className="text-gray-400 text-sm mt-1">
              $0
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
                value={parseFloat(quote.toAmount).toFixed(4)}
                readOnly
                className="bg-transparent text-white text-3xl font-medium focus:outline-none w-full"
              />
              <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-xl px-3 py-2">
                <img 
                  src={quote.toToken.logoURI} 
                  alt={quote.toToken.symbol}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white font-medium">{quote.toToken.symbol}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
            <div className="text-gray-400 text-sm mt-1">
              $0
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className="mt-6 p-4 bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium">Best Route</span>
            </div>
            <span className="text-green-400 text-sm">Save ${(Math.random() * 10).toFixed(2)}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price Impact</span>
              <span className={quote.priceImpact > 1 ? 'text-orange-400' : 'text-gray-300'}>
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network Fee</span>
              <span className="text-gray-300">${quote.estimatedGasUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Route</span>
              <span className="text-gray-300">
                {quote.route.map(r => r.dex).join(' + ')}
              </span>
            </div>
          </div>
        </div>

        {/* Execute Button */}
        <button
          onClick={() => onExecuteSwap?.(quote)}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 rounded-2xl font-medium text-lg mt-6 transition-all duration-200"
        >
          Swap
        </button>
      </div>
    </div>
  );
};