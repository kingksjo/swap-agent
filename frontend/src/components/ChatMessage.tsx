import React from 'react';
import { Bot, User, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { ChatMessage as ChatMessageType, SwapQuote } from '../types';

interface Props {
  message: ChatMessageType;
  onExecuteSwap?: (quote: SwapQuote) => void;
}

export const ChatMessage: React.FC<Props> = ({ message, onExecuteSwap }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  const renderQuote = (quote: SwapQuote) => (
    <div className="mt-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium">Best Route Found</h4>
        <div className="flex items-center gap-1 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Verified</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-sm">You Pay</p>
          <p className="text-white font-medium">
            {parseFloat(quote.fromAmount).toFixed(4)} {quote.fromToken.symbol}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">You Get</p>
          <p className="text-white font-medium">
            {parseFloat(quote.toAmount).toFixed(4)} {quote.toToken.symbol}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Price Impact</span>
          <span className={quote.priceImpact > 1 ? 'text-orange-400' : 'text-gray-300'}>
            {quote.priceImpact.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Estimated Gas</span>
          <span className="text-gray-300">${quote.estimatedGasUSD.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Slippage Tolerance</span>
          <span className="text-gray-300">{quote.slippage}%</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-2">Route Breakdown</p>
        <div className="space-y-1">
          {quote.route.map((route, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-300">{route.dex}</span>
              <span className="text-gray-300">{route.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {quote.priceImpact > 1 && (
        <div className="flex items-start gap-2 p-3 bg-orange-900/20 border border-orange-700 rounded-lg mb-4">
          <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-orange-400 text-sm font-medium">High Price Impact Warning</p>
            <p className="text-orange-300 text-xs mt-1">
              This trade will significantly affect the token price. Consider splitting into smaller trades.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => onExecuteSwap?.(quote)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4" />
        Execute Swap
      </button>
    </div>
  );

  const renderTransaction = (tx: { hash: string; status: string }) => (
    <div className="mt-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        {tx.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
        {tx.status === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
        {tx.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-400" />}
        <span className="text-white font-medium capitalize">{tx.status}</span>
      </div>
      <p className="text-gray-400 text-sm">Transaction Hash:</p>
      <p className="text-blue-400 text-sm font-mono break-all">{tx.hash}</p>
    </div>
  );

  const renderEducationalContent = (content: { title: string; explanation: string }) => (
    <div className="mt-3 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
      <h4 className="text-blue-400 font-medium mb-2">{content.title}</h4>
      <p className="text-blue-300 text-sm whitespace-pre-line">{content.explanation}</p>
    </div>
  );

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-purple-500 to-blue-600' 
          : isSystem 
            ? 'bg-gradient-to-br from-orange-500 to-red-600'
            : 'bg-gradient-to-br from-green-500 to-blue-600'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : isSystem ? (
          <AlertTriangle className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-4 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : isSystem
              ? 'bg-orange-900/20 border border-orange-700 text-orange-200'
              : 'bg-gray-800 text-white border border-gray-700'
        }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {/* Render metadata */}
          {message.metadata?.quote && renderQuote(message.metadata.quote)}
          {message.metadata?.transaction && renderTransaction(message.metadata.transaction)}
          {message.metadata?.educationalContent && renderEducationalContent(message.metadata.educationalContent)}
        </div>
        
        <p className="text-gray-500 text-xs mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};