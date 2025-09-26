import React from 'react';

interface SuggestionButtonProps {
  text: string;
  onClick: () => void;
}

export const SuggestionButton: React.FC<SuggestionButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-transparent border border-background-secondary hover:bg-background-secondary text-text-secondary font-medium py-2 px-4 rounded-lg transition-colors"
    >
      {text}
    </button>
  );
};
