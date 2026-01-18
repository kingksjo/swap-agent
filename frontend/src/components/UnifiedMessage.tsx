import React, { useState } from 'react';
import { AlertTriangle, Copy, Upload, MoreHorizontal } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  message: ChatMessageType;
}

export const UnifiedMessage: React.FC<Props> = ({ message }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const isAssistant = message.type === 'assistant';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleUpload = () => {
    // TODO: Implement upload functionality
    console.log('Upload clicked');
  };

  const handleMore = () => {
    // TODO: Implement more options
    console.log('More options clicked');
  };

  const getIcon = () => {
    if (isUser) {
      // User doesn't have an icon in the new design
      return null;
    }
    if (isSystem) {
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
    // // For assistant, return the Miye logo
    // return <img src="/miye.svg" alt="Miye" className="w-5 h-5" />;
  };

  const renderContent = () => {
    // Shared markdown components
    const markdownComponents = {
        p: ({ children } : { children: React.ReactNode }) => <p className="mb-3 last:mb-0 leading-7">{children}</p>,
        ul: ({ children } : { children: React.ReactNode }) => <ul className="list-disc list-outside ml-4 space-y-2 mb-3">{children}</ul>,
        ol: ({ children } : { children: React.ReactNode }) => <ol className="list-decimal list-outside ml-4 space-y-2 mb-3">{children}</ol>,
        li: ({ children } : { children: React.ReactNode }) => <li className="leading-7">{children}</li>,
        strong: ({ children } : { children: React.ReactNode }) => <strong className="font-bold text-white">{children}</strong>,
        em: ({ children } : { children: React.ReactNode }) => <em className="italic">{children}</em>,
        code: ({ children } : { children: React.ReactNode }) => <code className="bg-accent/20 text-accent px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
        pre: ({ children } : { children: React.ReactNode }) => <pre className="bg-background-secondary p-4 rounded-lg overflow-x-auto text-sm font-mono my-3 border border-white/10">{children}</pre>,
        h1: ({ children } : { children: React.ReactNode }) => <h1 className="text-2xl font-bold mb-3 mt-4 first:mt-0 text-white">{children}</h1>,
        h2: ({ children } : { children: React.ReactNode }) => <h2 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-white">{children}</h2>,
        h3: ({ children } : { children: React.ReactNode }) => <h3 className="text-lg font-semibold mb-2 mt-3 first:mt-0 text-white">{children}</h3>,
        blockquote: ({ children } : { children: React.ReactNode }) => <blockquote className="border-l-4 border-accent pl-4 my-3 italic text-text-secondary">{children}</blockquote>,
        hr: () => <hr className="my-4 border-white/10" />,
        a: ({ children, href } : { children: React.ReactNode, href?: string }) => <a href={href} className="text-accent hover:text-accent/80 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
    };

    return (
        <div className={isUser ? "text-accent leading-7" : "text-text-secondary leading-7"}>
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

  // Assistant and System messages - no bubble, just text with icon
  if (isAssistant || isSystem) {
    return (
      <div className={`w-full max-w-4xl mx-auto px-4 mb-6`}>
        <div className="flex gap-4 justify-start items-start">
          <div>
            {getIcon()}
          </div>
          <div className={`flex-1 max-w-[85%] ${isSystem ? 'text-red-400' : ''}`}>
            {renderContent()}
            
            {/* Action Icons - Only show for assistant messages */}
            {isAssistant && (
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-text-secondary/60 hover:text-text-secondary transition-colors duration-200"
                  title={copied ? "Copied!" : "Copy"}
                >
                  <Copy className="w-4 h-4" />
                  {copied && <span className="text-xs">Copied!</span>}
                </button>
                
                <button
                  onClick={handleUpload}
                  className="text-text-secondary/60 hover:text-text-secondary transition-colors duration-200"
                  title="Upload"
                >
                  <Upload className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleMore}
                  className="text-text-secondary/60 hover:text-text-secondary transition-colors duration-200"
                  title="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User messages - white bubble on the right
  return (
    <div className={`w-full max-w-4xl mx-auto px-4 mb-6 flex gap-4 justify-end`}>
      <div className={`max-w-[80%]`}>
        <div className={`inline-block px-5 py-3 rounded-2xl bg-white text-accent rounded-br-none`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
