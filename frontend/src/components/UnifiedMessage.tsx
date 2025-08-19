import React from 'react';
import { Bot, User, Sparkles, TrendingUp, Shield, Zap, AlertTriangle } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  message: ChatMessageType;
  isLatest?: boolean;
}

export const UnifiedMessage: React.FC<Props> = ({ message, isLatest }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const isAssistant = message.type === 'assistant';

  const getIcon = () => {
    if (isUser) {
      return <User className="w-4 h-4 text-white" />;
    }
    if (isSystem) {
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
    
    // Assistant message - dynamic icon based on content
    if (message.content.includes('Finding') || message.content.includes('Checking')) {
      return <Sparkles className="w-4 h-4 text-orange-400" />;
    }
    if (message.content.includes('route') || message.content.includes('best')) {
      return <TrendingUp className="w-4 h-4 text-amber-400" />;
    }
    if (message.content.includes('safety') || message.content.includes('risk')) {
      return <Shield className="w-4 h-4 text-orange-400" />;
    }
    if (message.content.includes('Executing') || message.content.includes('submitted')) {
      return <Zap className="w-4 h-4 text-orange-300" />;
    }
    return <Bot className="w-4 h-4 text-orange-400" />;
  };



  const renderContent = () => {
    if (isAssistant) {
      // Assistant messages support markdown
      return (
        <div className="text-white leading-relaxed">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="text-white mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="text-white list-disc list-inside space-y-1 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="text-white list-decimal list-inside space-y-1 mb-2">{children}</ol>,
              li: ({ children }) => <li className="text-white">{children}</li>,
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
              em: ({ children }) => <em className="text-white italic">{children}</em>,
              code: ({ children }) => <code className="text-orange-300 bg-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>,
              pre: ({ children }) => <pre className="text-white bg-gray-800 p-2 rounded overflow-x-auto">{children}</pre>,
              h1: ({ children }) => <h1 className="text-white text-xl font-bold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-white text-lg font-semibold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-white text-base font-medium mb-2">{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      );
    } else {
      // User and system messages use plain text
      return (
        <div className="text-white leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-4">
      <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-r from-orange-500 to-amber-500' 
              : isSystem
                ? 'bg-red-500/20 border border-red-500/30'
                : 'bg-[#2A2A2A]'
          }`}>
            {getIcon()}
          </div>
        </div>

        {/* Message Bubble */}
        <div className={`max-w-[70%] ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block px-4 py-3 ${
            isUser 
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl rounded-br-lg' 
              : isSystem
                ? 'bg-red-500/20 border border-red-500/30 text-red-200 rounded-2xl rounded-bl-lg'
                : 'bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-2xl rounded-bl-lg'
          }`}>
            {renderContent()}
            
            {message.metadata?.educationalContent && (
              <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <h4 className="text-orange-400 font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  {message.metadata.educationalContent.title}
                </h4>
                <div className="text-orange-300/90 text-sm leading-relaxed whitespace-pre-line">
                  {message.metadata.educationalContent.explanation}
                </div>
              </div>
            )}
            
            {message.metadata?.transaction && (
              <div className="mt-3 p-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Transaction Hash</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    message.metadata.transaction.status === 'pending' 
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : message.metadata.transaction.status === 'success'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}>
                    {message.metadata.transaction.status}
                  </span>
                </div>
                <div className="text-orange-400 text-xs font-mono break-all">
                  {message.metadata.transaction.hash}
                </div>
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <div className={`text-gray-500 text-xs mt-1 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};
