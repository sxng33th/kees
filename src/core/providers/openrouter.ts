import { ProviderAdapter, GenerateRequest, GenerateResponse } from '../types';

export const openrouterAdapter: ProviderAdapter = {
  id: 'openrouter',
  async generate(request: GenerateRequest, apiKey: string): Promise<GenerateResponse> {
    const startTime = Date.now();
    
    // Default model if none specified
    const model = request.model || 'openai/gpt-4o-mini';

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const latencyMs = Date.now() - startTime;
    const text = data.choices[0]?.message?.content || '';

    return {
      text,
      provider: 'openrouter',
      model: data.model || model,
      latencyMs
    };
  }
};
