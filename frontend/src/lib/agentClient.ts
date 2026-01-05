import { getMockResponse, MOCK_CONFIRMATION_RESPONSE } from '../data/mockResponses';

export type AgentMessage =
  | { type: 'assistant_text'; text: string }
  | { type: 'swap_quote'; data: any }
  | { type: 'confirmation_request'; action_id: string }
  | { type: 'swap_result'; data: any }
  | { type: 'error'; code: string; message: string };

// Check if mock mode is enabled via environment variable
const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Simulate network delay for more realistic mock responses
 */
const simulateDelay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms));

export async function sendToAgent(
  input: string,
  sessionId: string,
  ctx?: any
): Promise<{ messages: AgentMessage[]; session_id?: string }> {
  // Use mock data if enabled
  if (isMockMode) {
    console.log('🎭 Mock Mode: Using mock response for:', input);
    await simulateDelay(1000); // Simulate network delay
    const messages = getMockResponse(input);
    return { messages, session_id: sessionId };
  }

  // Real backend call
  const url = `${import.meta.env.VITE_AGENT_URL || 'http://localhost:8000'}/chat`;

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  const agentKey = import.meta.env.VITE_AGENT_KEY as string | undefined;
  if (agentKey) headers['x-agent-key'] = agentKey;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: input, session_id: sessionId, context: ctx }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Agent error: ${res.status} ${text}`);
  }

  const json = await res.json();
  const messages: AgentMessage[] = json.messages || [{ type: 'assistant_text', text: json.response ?? '' }];
  return { messages, session_id: json.session_id };
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


