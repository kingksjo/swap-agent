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
    <div className="flex flex-col items-center justify-center mt-10 h-full text-center">
      <div className="mb-4">
        <span className="inline-block bg-background-secondary border-2 border-white mt-5 text-text-secondary text-sm font-medium px-4 py-2 rounded-full shadow-lg shadow-accent/30">
          Introducing Miye
        </span>
      </div>
      <h1 className="text-4xl font-bold text-text-primary mb-5 mt-8">What can I help with?</h1>
      <div className="w-full max-w-2xl px-4">
        <ConversationalInput onSendMessage={onSendMessage} />
        <div className="flex justify-center gap-4 mt-6">
          <SuggestionButton text="Swap Tokens" onClick={() => handleSuggestionClick('Swap 1 ETH for USDC')} />
          <SuggestionButton text="Market Trends" onClick={() => handleSuggestionClick('What are the latest market trends?')} />
          <SuggestionButton text="Learn" onClick={() => handleSuggestionClick('How to use Miye?')} />
        </div>
      </div>
      <div className="absolute bottom-4 text-[10px] text-text-secondary/50">
        Miye Terms and the Miye Privacy Policy apply. Miye can make mistakes, so double-check it.
      </div>
    </div>
  );
};
