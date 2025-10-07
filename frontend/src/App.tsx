import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConversationalInput } from './components/ConversationalInput';
import { SwapCard } from './components/SwapCard';
// import { ConversationHistory } from './components/ConversationHistory';
import { UnifiedMessage } from './components/UnifiedMessage';
import { LandingPage } from './components/LandingPage';

import { sendToAgent, confirmAction } from './lib/agentClient';
import { ChatMessage as ChatMessageType, SwapQuote, UserPreferences } from './types';
import { useAccount } from 'wagmi';




function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [preferences] = useState<UserPreferences>({
    favoriteTokens: [],
    defaultSlippage: 0.5,
    preferredNetworks: [1, 137],
    riskTolerance: 'medium'
  });
  
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
        recipient: address,
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
        } else if (msg.type === 'swap_quote') {
          // Convert agent quote format to frontend SwapQuote format
          const quoteData = msg.data;
          const swapQuote: SwapQuote = {
            fromToken: {
              address: '', 
              symbol: quoteData.fromToken,
              name: quoteData.fromToken,
              decimals: 18,
              chainId: 1,
              verified: true,
              logoURI: `/tokens/${quoteData.fromToken.toLowerCase()}.png`
            },
            toToken: {
              address: '',
              symbol: quoteData.toToken, 
              name: quoteData.toToken,
              decimals: 18,
              chainId: 1,
              verified: true,
              logoURI: `/tokens/${quoteData.toToken.toLowerCase()}.png`
            },
            fromAmount: quoteData.inputAmount,
            toAmount: quoteData.estimatedOutput || '0',
            priceImpact: parseFloat(quoteData.priceImpact?.replace('%', '') || '0') / 100,
            gasEstimate: quoteData.gasEstimate || '0.002',
            route: (quoteData.route || []).map((dex: string) => ({
              dex,
              percentage: 100 / (quoteData.route?.length || 1),
              gasEstimate: '0.001'
            })),
            slippage: (quoteData.slippage_bps || 100) / 100,
            estimatedGasUSD: 5.0
          };
          setCurrentQuote(swapQuote);
        } else if (msg.type === 'confirmation_request') {
          setPendingActionId(msg.action_id);
        } else if (msg.type === 'swap_result') {
          const resultData = msg.data;
          addMessage({
            id: generateMessageId(),
            type: 'assistant',
            content: `🎉 Swap executed successfully!\n\nTransaction submitted to the blockchain.`,
            timestamp: new Date(),
            metadata: {
              transaction: {
                hash: resultData.tx_hash,
                status: resultData.status
              }
            }
          });
          // Clear quote and action ID after successful swap
          setCurrentQuote(null);
          setPendingActionId(null);
        }
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

  const handleExecuteSwap = async () => {
    if (!pendingActionId) {
      addMessage({
        id: generateMessageId(),
        type: 'system',
        content: 'No pending swap action found. Please try again.',
        timestamp: new Date()
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Send confirmation to agent
      const { messages: confirmMsgs } = await confirmAction(pendingActionId, true);

      // Process the confirmation response messages
      for (const msg of confirmMsgs) {
        if (msg.type === 'assistant_text') {
          addMessage({
            id: generateMessageId(),
            type: 'assistant',
            content: msg.text,
            timestamp: new Date()
          });
        } else if (msg.type === 'swap_result') {
          const resultData = msg.data;
          addMessage({
            id: generateMessageId(),
            type: 'assistant',
            content: `🎉 Swap executed successfully!\n\nTransaction submitted to the blockchain.`,
            timestamp: new Date(),
            metadata: {
              transaction: {
                hash: resultData.tx_hash,
                status: resultData.status
              }
            }
          });
        }
      }

      // Clear the current quote and pending action
      setCurrentQuote(null);
      setPendingActionId(null);

    } catch (error) {
      console.error('Error confirming swap:', error);
      addMessage({
        id: generateMessageId(),
        type: 'system',
        content: 'Failed to execute swap. Please try again.',
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <LandingPage onSendMessage={handleSendMessage} />
        ) : (
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
            <div className={`w-full max-w-2xl transition-all duration-300 mt-32 mb-8`}>
              <div className={''}>
                <ConversationalInput
                  onSendMessage={handleSendMessage}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;