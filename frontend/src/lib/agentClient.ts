export type AgentMessage =
  | { type: 'assistant_text'; text: string }
  | { type: 'confirmation_request'; data: any }
  | { type: 'error'; message: string };

export async function sendToAgent(
  input: string,
  sessionId: string,
  ctx?: any
): Promise<{ messages: AgentMessage[]; session_id?: string }> {
  const baseUrl = import.meta.env.VITE_AGENT_URL || 'http://localhost:8000';
  const url = `${baseUrl}/api/v1/chat`;

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
