import { ProviderAdapter, GenerateRequest, GenerateResponse } from '../types';

export const freemodelAdapter: ProviderAdapter = {
  id: 'freemodel',
  async generate(request: GenerateRequest, apiKey: string): Promise<GenerateResponse> {
    const startTime = Date.now();
    const model = request.model || 'gpt-5.5';

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await fetch('https://api.freemodel.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Freemodel API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const latencyMs = Date.now() - startTime;
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      provider: 'freemodel',
      model,
      latencyMs
    };
  }
};
