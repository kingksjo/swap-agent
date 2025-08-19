import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConversationalInput } from './components/ConversationalInput';
import { SwapCard } from './components/SwapCard';
// import { ConversationHistory } from './components/ConversationHistory';
import { UnifiedMessage } from './components/UnifiedMessage';
import { useWallet } from './hooks/useWallet';
import { SwapService } from './utils/swapService';
import { sendToAgent } from './lib/agentClient';
import { ChatMessage as ChatMessageType, SwapQuote, UserPreferences } from './types';

function App() {
  const { wallet } = useWallet();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preferences] = useState<UserPreferences>({
    favoriteTokens: [],
    defaultSlippage: 0.5,
    preferredNetworks: [1, 137],
    riskTolerance: 'medium'
  });
  
  const swapService = new SwapService();
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // Remove auto-welcome; keep interface clean until user interacts
  useEffect(() => {}, []);

  const addMessage = (message: ChatMessageType) => {
    setMessages(prev => [...prev, message]);
  };

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSendMessage = async (content: string) => {
    // Allow chatting even if wallet is disconnected; agent can still provide contextual guidance

    // Add user message
    const userMessage: ChatMessageType = {
      id: generateMessageId(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    addMessage(userMessage);

    setIsProcessing(true);

    try {
      const sessionId = sessionIdRef.current;
      const ctx = {
        recipient: wallet?.address,
        defaults: { slippage_bps: Math.round((preferences.defaultSlippage || 0.5) * 100) }
      };
      const { messages: agentMsgs } = await sendToAgent(content, sessionId, ctx);

      for (const msg of agentMsgs) {
        if (msg.type === 'assistant_text') {
          addMessage({
            id: generateMessageId(),
            type: 'assistant',
            content: msg.text,
            timestamp: new Date()
          });
        }
        // Future: handle swap_quote / confirmation_request / swap_result
      }
    } catch (error) {
      console.error('Error processing swap:', error);
      addMessage({
        id: generateMessageId(),
        type: 'system',
        content: '❌ Something went wrong while contacting the agent. Please try again.',
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteSwap = async (quote: SwapQuote) => {
    setIsProcessing(true);

    try {
      addMessage({
        id: generateMessageId(),
        type: 'assistant',
        content: 'Executing your swap... Please confirm the transaction in your wallet.',
        timestamp: new Date()
      });

      const transaction = await swapService.executeSwap(quote);

      addMessage({
        id: generateMessageId(),
        type: 'assistant',
        content: '🎉 Swap submitted successfully!\n\nYour transaction is now processing on the blockchain.',
        timestamp: new Date(),
        metadata: { transaction }
      });

      // Simulate transaction completion after a delay
      setTimeout(() => {
        const completedTx = { ...transaction, status: 'success' as const };
        addMessage({
          id: generateMessageId(),
          type: 'assistant',
        content: `Swap completed! You received ${parseFloat(quote.toAmount).toFixed(4)} ${quote.toToken.symbol} for ${parseFloat(quote.fromAmount).toFixed(4)} ${quote.fromToken.symbol}. Your tokens should appear in your wallet shortly.`,
          timestamp: new Date(),
          metadata: { transaction: completedTx }
        });
      }, 5000);

    } catch (error) {
      console.error('Error executing swap:', error);
      addMessage({
        id: generateMessageId(),
        type: 'system',
        content: 'Failed to execute swap. Please check your wallet connection and try again.',
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col">
        {/* Centered Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Conversation History */}
          {messages.length > 0 && (
            <div className="w-full max-w-4xl mb-8">
              {messages.map(message => (
                <UnifiedMessage key={message.id} message={message} />
              ))}
              
              {isProcessing && (
                <div className="w-full max-w-4xl mx-auto px-4 mb-6">
                  <div className="border border-[#2A2A2A] bg-[#1A1A1A] rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#2A2A2A] rounded-xl flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="text-gray-400">Processing your request...</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Swap Card - show when quote is available */}
          {currentQuote && (
            <div className="w-full max-w-md mb-8">
              <SwapCard quote={currentQuote} onExecuteSwap={handleExecuteSwap} />
            </div>
          )}
          
          {/* Input */}
          <div className={`w-full max-w-2xl transition-all duration-300 ${messages.length === 0 ? 'mt-[-10vh]' : ''}`}>
            <div className={`${messages.length === 0 ? 'shadow-[0_0_40px_5px_rgba(249,115,22,0.25)] border border-orange-500/30 rounded-2xl p-2' : ''}`}>
              <ConversationalInput
                onSendMessage={handleSendMessage}
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;