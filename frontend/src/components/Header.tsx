import React from 'react';
import { Zap, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="bg-[#0D0D0D] border-b border-[#1A1A1A] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
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
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-4 py-2 pl-10 text-white placeholder-gray-400 w-80 focus:outline-none focus:border-[#3A3A3A] transition-colors"
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
          
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full font-medium text-sm">
            0x4a2B...55bd
          </div>
        </div>
      </div>
    </div>
  );
};