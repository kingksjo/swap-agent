import { getMockResponse, MOCK_CONFIRMATION_RESPONSE } from '../data/mockResponses';
import type { TransactionProposal } from '../types';

export type AgentMessage =
  | { type: 'assistant_text'; text: string }
  | { type: 'confirmation_request'; data: any }
  | { type: 'error'; message: string };

// Check if mock mode is enabled via environment variable
const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Simulate network delay for more realistic mock responses
 */
const simulateDelay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send a message to the agent and receive a response with optional transaction proposal
 * @returns Object containing message text, optional proposed_transaction, and conversation_id
 */
export async function sendToAgent(
  input: string,
  sessionId: string,
  ctx?: any
): Promise<{ 
  message: string; 
  proposed_transaction?: TransactionProposal; 
  conversation_id: string 
}> {
  // Use mock data if enabled
  if (isMockMode) {
    console.log('🎭 Mock Mode: Using mock response for:', input);
    await simulateDelay(1000); // Simulate network delay
    const messages = getMockResponse(input);
    
    // Convert old mock format to new API format
    const textMessage = messages.find(m => m.type === 'assistant_text');
    return { 
      message: textMessage?.text || 'Mock response', 
      proposed_transaction: undefined,
      conversation_id: sessionId 
    };
  }

  // Real backend call
  const url = `${import.meta.env.VITE_AGENT_URL || 'http://localhost:8000'}/chat`;

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  const agentKey = import.meta.env.VITE_AGENT_KEY as string | undefined;
  if (agentKey) headers['x-agent-key'] = agentKey;

  // Backend expects: { message, conversation_id, user_address }
  const requestBody: any = {
    message: input,
    conversation_id: sessionId,  // Changed from session_id to conversation_id
  };
  
  // Add user_address if available in context
  if (ctx?.recipient) {
    requestBody.user_address = ctx.recipient;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: input, conversation_id: sessionId, context: ctx }),

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Agent error: ${res.status} ${text}`);
  }

  // Backend returns: { message, proposed_transaction, conversation_id }
  const json = await res.json();
  
  // Parse FastAPI response matching ChatResponse schema
  return {
    message: json.message || '',
    proposed_transaction: json.proposed_transaction || undefined,
    conversation_id: json.conversation_id || sessionId
  };
}

export async function confirmAction(
  actionId: string,
  confirm: boolean = true
): Promise<{ messages: AgentMessage[] }> {
  // Use mock data if enabled
  if (isMockMode) {
    console.log('🎭 Mock Mode: Confirming action:', actionId);
    await simulateDelay(1500); // Simulate transaction time
    return { messages: MOCK_CONFIRMATION_RESPONSE };
  }

  // Real backend call
  const url = `${import.meta.env.VITE_AGENT_URL || 'http://localhost:8000'}/confirm`;

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  const agentKey = import.meta.env.VITE_AGENT_KEY as string | undefined;
  if (agentKey) headers['x-agent-key'] = agentKey;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action_id: actionId, confirm }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Agent confirm error: ${res.status} ${text}`);
  }

  const json = await res.json();
  const messages: AgentMessage[] = json.messages || [];
  return { messages };
}

/**
 * Check if the app is currently in mock mode
 */
export function isUsingMockData(): boolean {
  return isMockMode;
}
