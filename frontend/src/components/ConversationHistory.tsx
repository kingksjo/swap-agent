import React from 'react';
import { Bot, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface Props {
  messages: ChatMessageType[];
}

export const ConversationHistory: React.FC<Props> = ({ messages }) => {
  if (messages.length <= 1) return null; // Don't show if only welcome message

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-8">
      <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          Recent Activity
        </h3>
        
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {messages.slice(-5).map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : message.type === 'system'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-pink-500/20 text-pink-400'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : message.type === 'system' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm leading-relaxed">
                  {message.content.split('\n')[0]} {/* Show first line only */}
                </div>
                
                {message.metadata?.transaction && (
                  <div className="flex items-center gap-2 mt-2">
                    {message.metadata.transaction.status === 'pending' && (
                      <Clock className="w-3 h-3 text-yellow-400" />
                    )}
                    {message.metadata.transaction.status === 'success' && (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    )}
                    <span className="text-xs text-gray-400 capitalize">
                      {message.metadata.transaction.status}
                    </span>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};