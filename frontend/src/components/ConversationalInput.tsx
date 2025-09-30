import React, { useState, KeyboardEvent } from 'react';
import { SendHorizonal } from 'lucide-react';

interface Props {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ConversationalInput: React.FC<Props> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const message = input.trim();
    if (message && !disabled) {
      onSendMessage(message);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything"
          disabled={disabled}
          className="w-full bg-transparent border border-white-50 rounded-full px-6 py-4 pr-16 text-white placeholder-gray-500 text-base focus:outline-none focus:border-accent/70 transition-all duration-200 disabled:opacity-50"
        />
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {input.trim() && (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="text-text-secondary/80 hover:text-text-primary disabled:text-gray-600 transition-colors duration-200 disabled:opacity-50"
            >
              <SendHorizonal className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};