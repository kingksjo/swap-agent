import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConversationalInput } from './components/ConversationalInput';
import { UnifiedMessage } from './components/UnifiedMessage';
import { LandingPage } from './components/LandingPage';
import { MockModeIndicator } from './components/MockModeIndicator';


import { sendToAgent } from './lib/agentClient';
import { executeSwap, getExplorerUrl } from './lib/swapExecution';
import { ChatMessage as ChatMessageType, UserPreferences, TransactionProposal, SwapProposal, SendProposal } from './types';
import { useAccount, useConfig } from 'wagmi';
import type { Address } from 'viem';




function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);

  const { address, isConnected } = useAccount();
  const wagmiConfig = useConfig();
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

  const handleExecuteSwap = async (proposal: TransactionProposal) => {
    console.log('Execute swap clicked!', proposal);

    if (!address || !isConnected) {
      addMessage({
        id: generateMessageId(),
        type: 'system',
        content: '⚠️ Please connect your wallet first to execute the swap.',
        timestamp: new Date()
      });
      return;
    }

    setIsProcessing(true);
    try {
      const actionLabel = proposal.action === 'swap'
        ? `${(proposal as SwapProposal).amount} ${(proposal as SwapProposal).tokenIn} → ${(proposal as SwapProposal).tokenOut}`
        : `${(proposal as SendProposal).amount} ${(proposal as SendProposal).token} to ${(proposal as SendProposal).toAddress}`;

      addMessage({
        id: generateMessageId(),
        type: 'system',
        content: `🔄 Submitting: ${actionLabel}... Please confirm in your wallet.`,
        timestamp: new Date()
      });

      if (proposal.action === 'swap') {
        const swap = proposal as SwapProposal;

        // Execute real on-chain swap via Uniswap V3
        const result = await executeSwap(wagmiConfig, swap, address as Address);

        if (result.success && result.txHash) {
          const explorerUrl = getExplorerUrl(result.txHash, swap.chain);

          addMessage({
            id: generateMessageId(),
            type: 'system',
            content: `✅ Swap confirmed! [View on BaseScan](${explorerUrl})`,
            timestamp: new Date(),
            metadata: {
              transaction: { hash: result.txHash, status: 'success' }
            }
          });

          // Report real tx hash back to agent
          const sessionId = sessionIdRef.current;
          const response = await sendToAgent(
            `Transaction ${result.txHash} completed successfully. Swapped ${swap.amount} ${swap.tokenIn} for ${swap.tokenOut}.`,
            sessionId
          );

          if (response.message) {
            addMessage({
              id: generateMessageId(),
              type: 'assistant',
              content: response.message,
              timestamp: new Date()
            });
          }
        } else {
          addMessage({
            id: generateMessageId(),
            type: 'system',
            content: `❌ Swap failed: ${result.error || 'Unknown error'}`,
            timestamp: new Date()
          });
        }

      } else if (proposal.action === 'send') {
        // TODO: Implement ERC20 transfer / native ETH send
        addMessage({
          id: generateMessageId(),
          type: 'system',
          content: '⚠️ Direct token sends are not yet implemented on-chain.',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Swap execution error:', error);
      addMessage({
        id: generateMessageId(),
        type: 'system',
        content: `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
      
      // New API structure: { message, proposed_transaction, conversation_id }
      const response = await sendToAgent(content, sessionId, ctx);
      
      // Update session ID with the one from the backend
      sessionIdRef.current = response.conversation_id;

      // Create assistant message with the response text
      const assistantMessage: ChatMessageType = {
        id: generateMessageId(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: response.proposed_transaction ? {
          proposal: response.proposed_transaction
        } : undefined
      };
      
      addMessage(assistantMessage);

    } catch (error) {
      console.error('Error contacting agent:', error);
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

  return (
    <div className="min-h-screen bg-background-primary flex flex-col h-screen">
      <Header />
      <MockModeIndicator />

      
      <main className="flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          <LandingPage onSendMessage={handleSendMessage} />
        ) : (
          <>
            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="w-full max-w-4xl mx-auto">
                {messages.map(message => (
                  <UnifiedMessage key={message.id} message={message} onExecuteSwap={handleExecuteSwap} />
                ))}
                
                {isProcessing && (
                  <div className="w-full px-4 mb-6 flex gap-4 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-background-secondary">
                      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-text-secondary text-sm pt-1">Thinking...</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Input */}
            <div className={`w-full max-w-2xl mx-auto p-4 mb-5 mt-5`}>
              <ConversationalInput
                onSendMessage={handleSendMessage}
                disabled={isProcessing}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;