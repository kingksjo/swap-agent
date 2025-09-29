import React from 'react';

interface SuggestionButtonProps {
  text: string;
  onClick: () => void;
}

export const SuggestionButton: React.FC<SuggestionButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-transparent border border-accent/70 hover:bg-background-secondary text-text-secondary font-medium py-2 px-6 rounded-lg transition-colors min-w-[140px] flex justify-center"
    >
      {text}
    </button>
  );
};
