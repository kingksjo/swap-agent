import React from 'react';

interface SuggestionButtonProps {
  text: string;
  onClick: () => void;
}

export const SuggestionButton: React.FC<SuggestionButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-transparent border border-white/20 hover:border-accent text-text-secondary font-medium py-2 px-6 rounded-lg transition-all min-w-[140px] flex justify-center hover:shadow-[0_0_15px_rgba(249,115,22,0.5)]"
    >
      {text}
    </button>
  );
};
