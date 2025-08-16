import React, { useState, KeyboardEvent } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';

interface Props {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ConversationalInput: React.FC<Props> = ({ onSendMessage, disabled }) => {
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
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isListening 
              ? "Listening..." 
              : "Ask SwapAI"
          }
          disabled={disabled || isListening}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-6 py-4 pr-16 text-white placeholder-gray-400 text-lg focus:outline-none focus:border-[#3A3A3A] transition-all duration-200 disabled:opacity-50"
        />
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {isSupported && (
            <button
              onClick={handleVoiceToggle}
              disabled={disabled}
              className={`p-2 rounded-full transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              } disabled:opacity-50`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
          
          {(input.trim() || transcript.trim()) && (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white p-2 rounded-full transition-colors duration-200 disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};