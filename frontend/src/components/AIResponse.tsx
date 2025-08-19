import React from 'react';
import { Bot, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  message: ChatMessageType;
  isLatest?: boolean;
}

export const AIResponse: React.FC<Props> = ({ message, isLatest }) => {
  if (message.type === 'user') return null;

  const getIcon = () => {
    if (message.content.includes('Finding') || message.content.includes('Checking')) {
      return <Sparkles className="w-5 h-5 text-orange-400" />;
    }
    if (message.content.includes('route') || message.content.includes('best')) {
      return <TrendingUp className="w-5 h-5 text-amber-400" />;
    }
    if (message.content.includes('safety') || message.content.includes('risk')) {
      return <Shield className="w-5 h-5 text-orange-400" />;
    }
    if (message.content.includes('Executing') || message.content.includes('submitted')) {
      return <Zap className="w-5 h-5 text-orange-300" />;
    }
    return <Bot className="w-5 h-5 text-orange-400" />;
  };

  const getAccentColor = () => {
    if (message.content.includes('Finding') || message.content.includes('Checking')) {
      return 'border-orange-500/20 bg-orange-500/5';
    }
    if (message.content.includes('route') || message.content.includes('best')) {
      return 'border-amber-500/20 bg-amber-500/5';
    }
    if (message.content.includes('safety') || message.content.includes('risk')) {
      return 'border-orange-500/20 bg-orange-500/5';
    }
    if (message.content.includes('Executing') || message.content.includes('submitted')) {
      return 'border-orange-300/20 bg-orange-300/5';
    }
    return 'border-[#2A2A2A] bg-[#1A1A1A]';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-8">
      <div className={`border rounded-2xl p-6 ${getAccentColor()}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#2A2A2A] rounded-xl flex items-center justify-center flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
            
            {message.metadata?.educationalContent && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {message.metadata.educationalContent.title}
                </h4>
                <div className="text-blue-300/90 text-sm leading-relaxed whitespace-pre-line">
                  {message.metadata.educationalContent.explanation}
                </div>
              </div>
            )}
            
            {message.metadata?.transaction && (
              <div className="mt-6 p-4 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">Transaction Hash</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    message.metadata.transaction.status === 'pending' 
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : message.metadata.transaction.status === 'success'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}>
                    {message.metadata.transaction.status}
                  </span>
                </div>
                <div className="text-blue-400 text-sm font-mono break-all">
                  {message.metadata.transaction.hash}
                </div>
              </div>
            )}
            
            <div className="text-gray-500 text-xs mt-4">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};