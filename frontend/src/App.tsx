import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { WalletConnection } from './components/WalletConnection';
import { ConversationalInput } from './components/ConversationalInput';
import { SwapCard } from './components/SwapCard';
import { ConversationHistory } from './components/ConversationHistory';
import { AIResponse } from './components/AIResponse';
import { useWallet } from './hooks/useWallet';
import { NLPProcessor } from './utils/nlpProcessor';
import { SwapService } from './utils/swapService';
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nlpProcessor = new NLPProcessor();
  const swapService = new SwapService();

  useEffect(() => {
    // Add welcome message
    addMessage({
      id: '1',
      type: 'assistant',
      content: `Welcome to SwapAI! I'm your intelligent trading assistant. I can help you swap tokens, find the best rates, and explain everything in simple terms.

Try commands like:
• "Swap 0.5 ETH to USDC"
• "Buy 100 DAI using ETH"
• "What's the best rate for UNI?"`,
      timestamp: new Date()
    });
  }, []);

  const addMessage = (message: ChatMessageType) => {
    setMessages(prev => [...prev, message]);
  };

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSendMessage = async (content: string) => {
    if (!wallet.isConnected) {
      addMessage({
        id: generateMessageId(),
        type: 'system',
        content: '⚠️ Please connect your wallet first to use swap functionality.',
        timestamp: new Date()
      });
      return;
    }

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
      // Process the command
      const parsedCommand = nlpProcessor.parseSwapCommand(content);
      
      if (!parsedCommand) {
        addMessage({
          id: generateMessageId(),
          type: 'assistant',
          content: `I couldn't understand that command. Try something like:

• "Swap 0.5 ETH to USDC"
• "Buy 100 DAI using ETH"  
• "What's the best rate for UNI?"`,
          timestamp: new Date()
        });
        return;
      }

      if (!parsedCommand.fromToken || !parsedCommand.toToken || !parsedCommand.amount) {
        addMessage({
          id: generateMessageId(),
          type: 'assistant',
          content: `I need more details. Please specify the tokens and amount you want to trade.`,
          timestamp: new Date()
        });
        return;
      }

      // Show processing message
      addMessage({
        id: generateMessageId(),
        type: 'assistant',
        content: `Finding the best route for ${parsedCommand.amount} ${parsedCommand.fromToken.symbol} → ${parsedCommand.toToken.symbol}...

Checking rates across multiple DEXs including Uniswap, SushiSwap, and 1inch.`,
        timestamp: new Date()
      });

      // Get quote
      const quote = await swapService.getQuote(
        parsedCommand.fromToken,
        parsedCommand.toToken,
        parsedCommand.amount,
        parsedCommand.slippage || preferences.defaultSlippage
      );

      // Generate educational content
      const educationalContent = nlpProcessor.generateEducationalResponse(quote);

      // Add result message with quote
      addMessage({
        id: generateMessageId(),
        type: 'assistant',
        content: `Found the best route! I've analyzed multiple DEXs and found an optimal path using ${quote.route.length} protocols to minimize costs and slippage.`,
        timestamp: new Date(),
        metadata: {
          educationalContent: {
            title: 'Understanding Your Swap',
            explanation: educationalContent
          }
        }
      });

      setCurrentQuote(quote);
    } catch (error) {
      console.error('Error processing swap:', error);
      addMessage({
        id: generateMessageId(),
        type: 'system',
        content: '❌ Something went wrong while processing your request. Please try again or contact support if the issue persists.',
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
        <WalletConnection />
        
        {/* Centered Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Welcome Message - only show if no other messages */}
          {messages.length === 1 && (
            <div className="w-full max-w-2xl mb-12">
              <AIResponse message={messages[0]} />
            </div>
          )}
          
          {/* Conversation History - show when there are multiple messages */}
          {messages.length > 1 && (
            <div className="w-full max-w-4xl mb-8 space-y-6">
              {messages.slice(1).map(message => (
                <AIResponse key={message.id} message={message} />
              ))}
              
              {isProcessing && (
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#2A2A2A] rounded-xl flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-gray-400">Processing your request...</div>
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
          
          {/* Centered Input */}
          <div className="w-full max-w-2xl">
            <ConversationalInput
              onSendMessage={handleSendMessage}
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;