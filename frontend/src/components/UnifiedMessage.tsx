import React from 'react';
import { Bot, User, AlertTriangle } from 'lucide-react';
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
      // User doesn't have an icon in the new design
      return null;
    }
    if (isSystem) {
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
    // For assistant, return the Miye logo
    return <img src="/miye.svg" alt="Miye" className="w-5 h-5" />;
  };

  const renderContent = () => {
    // Shared markdown components
    const markdownComponents = {
      p: ({ children }: { children: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
      ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
      ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
      li: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
      strong: ({ children }: { children: React.ReactNode }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }: { children: React.ReactNode }) => <em>{children}</em>,
      code: ({ children }: { children: React.ReactNode }) => <code className="bg-background-secondary px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
      pre: ({ children }: { children: React.ReactNode }) => <pre className="bg-background-secondary p-2 rounded overflow-x-auto text-sm font-mono">{children}</pre>,
      h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
      h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-xl font-semibold mb-2">{children}</h2>,
      h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
    };

    return (
      <div className={`text-text-primary leading-relaxed ${isUser ? 'text-accent/90' : ''}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          components={markdownComponents}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 mb-6 flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>

      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-background-secondary">
          {getIcon()}
        </div>
      )}

      <div className={`max-w-[80%]`}>
        <div className={`inline-block px-5 py-3 rounded-2xl ${isUser
            ? 'bg-text-primary rounded-br-none'
            : isSystem
              ? 'bg-red-900/50 text-red-200 rounded-bl-none'
              : 'bg-background-secondary text-text-primary rounded-bl-none'
          }`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
