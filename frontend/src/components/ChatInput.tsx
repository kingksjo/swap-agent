import React, { useState, KeyboardEvent } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';

interface Props {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<Props> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceInput();

  const handleSend = () => {
    const message = input.trim() || transcript.trim();
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

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const displayValue = input || (isListening ? transcript : '');

  return (
    <div className="flex gap-3 p-4 bg-gray-800 border-t border-gray-700">
      <div className="flex-1 relative">
        <textarea
          value={displayValue}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isListening 
              ? "Listening... Speak your swap command" 
              : "Type your swap command or click the mic to speak..."
          }
          disabled={disabled || isListening}
          className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          rows={1}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        
        {isSupported && (
          <button
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={`absolute right-3 top-3 p-1 rounded-full transition-colors duration-200 ${
              isListening 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      <button
        onClick={handleSend}
        disabled={disabled || (!input.trim() && !transcript.trim())}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
};