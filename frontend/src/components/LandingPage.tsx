import React from 'react';
import { ConversationalInput } from './ConversationalInput';
import { SuggestionButton } from './SuggestionButton';

interface LandingPageProps {
  // eslint-disable-next-line no-unused-vars
  onSendMessage: (message: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSendMessage }) => {
  const handleSuggestionClick = (text: string) => {
    onSendMessage(text);
  };

  return (
    <div className="flex-1 flex flex-col items-center text-center">
      {/* Top spacer */}
      <div className="flex-1" />
      
      {/* Main content */}
      <div className="flex flex-col items-center w-full max-w-2xl px-4">
        <div className="mb-6">
          <span className="inline-block bg-background-secondary border-2 border-white text-text-secondary text-sm font-medium px-4 py-2 rounded-full shadow-lg shadow-accent/30">
            Introducing Miye
          </span>
        </div>
        <h1 className="text-4xl font-bold text-text-primary mb-8">What can I help with?</h1>
        <div className="w-full">
          <ConversationalInput onSendMessage={onSendMessage} />
          <div className="flex justify-center gap-4 mt-6">
            <SuggestionButton text="Swap Tokens" onClick={() => handleSuggestionClick('Swap 1 ETH for USDC')} />
            <SuggestionButton text="Market Trends" onClick={() => handleSuggestionClick('What are the latest market trends?')} />
            <SuggestionButton text="Learn" onClick={() => handleSuggestionClick('How to use Miye?')} />
          </div>
        </div>
      </div>
      
      {/* Bottom spacer with footer */}
      <div className="flex-1 flex items-end justify-center pb-4">
        <div className="text-[10px] text-text-secondary/50">
          Miye Terms and the Miye Privacy Policy apply. Miye can make mistakes, so double-check it.
        </div>
      </div>
    </div>
  );
};
