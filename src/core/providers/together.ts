import { ProviderAdapter, GenerateRequest, GenerateResponse } from '../types';

export const togetherAdapter: ProviderAdapter = {
  id: 'together',
  async generate(request: GenerateRequest, apiKey: string): Promise<GenerateResponse> {
    const startTime = Date.now();
    const model = request.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1';

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
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
      throw new Error(`Together AI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const latencyMs = Date.now() - startTime;
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      provider: 'together',
      model,
      latencyMs
    };
  }
};
