import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConversationalInput } from './components/ConversationalInput';
import { UnifiedMessage } from './components/UnifiedMessage';
import { LandingPage } from './components/LandingPage';
import { MockModeIndicator } from './components/MockModeIndicator';


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
      const { messages: agentMsgs, proposed_transaction } = await sendToAgent(content, sessionId, ctx);

      // Log if we received a transaction proposal
      if (proposed_transaction) {
        console.log('📝 Received transaction proposal:', proposed_transaction);
        // TODO: Attach to message metadata for UI rendering
      }

      for (const msg of agentMsgs) {
        if (msg.type === 'assistant_text') {
          addMessage({
            id: generateMessageId(),
            type: 'assistant',
            content: msg.text,
            timestamp: new Date()
          });
        } else if (msg.type === 'confirmation_request') {
          const data = msg.data || {};
          const summaryLines: string[] = [];
          if (data.summary) summaryLines.push(data.summary);
          if (data.fee_info) {
            summaryLines.push('\nGas details:');
            if (data.fee_info.gas_limit) summaryLines.push(`- Gas limit: ${data.fee_info.gas_limit}`);
            if (data.fee_info.max_fee_per_gas) summaryLines.push(`- Max fee per gas: ${data.fee_info.max_fee_per_gas}`);
            if (data.fee_info.max_priority_fee_per_gas) summaryLines.push(`- Priority fee: ${data.fee_info.max_priority_fee_per_gas}`);
            if (data.fee_info.gas_price) summaryLines.push(`- Legacy gas price: ${data.fee_info.gas_price}`);
          }
          addMessage({
            id: generateMessageId(),
            type: 'assistant',
            content: summaryLines.join('\n'),
            timestamp: new Date()
          });
        }
      }
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
                  <UnifiedMessage key={message.id} message={message} />
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