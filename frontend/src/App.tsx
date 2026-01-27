import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConversationalInput } from './components/ConversationalInput';
import { UnifiedMessage } from './components/UnifiedMessage';
import { LandingPage } from './components/LandingPage';
import { MockModeIndicator } from './components/MockModeIndicator';


import { sendToAgent } from './lib/agentClient';
import { ChatMessage as ChatMessageType, UserPreferences } from './types';
import { useAccount } from 'wagmi';




function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const { address } = useAccount();
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
        walletAddress: address,
        defaults: { slippage_bps: Math.round((preferences.defaultSlippage || 0.5) * 100) }
      };
      
      // Get structured response from agent
      const response = await sendToAgent(content, sessionId, ctx);
      
      // Update session ID if provided
      if (response.conversation_id) {
        sessionIdRef.current = response.conversation_id;
      }

      // Add assistant message with proposal if present
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