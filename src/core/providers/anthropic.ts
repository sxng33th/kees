import { ProviderAdapter, GenerateRequest, GenerateResponse } from '../types';

export const anthropicAdapter: ProviderAdapter = {
  id: 'anthropic',
  async generate(request: GenerateRequest, apiKey: string): Promise<GenerateResponse> {
    const startTime = Date.now();
    const model = request.model || 'claude-3-5-sonnet-20241022';

    const messages = [{ role: 'user', content: request.prompt }];

    const body: any = {
      model,
      max_tokens: 4096,
      messages
    };

    if (request.systemPrompt) {
      body.system = request.systemPrompt;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const latencyMs = Date.now() - startTime;
    const text = data.content?.[0]?.text || '';

    return {
      text,
      provider: 'anthropic',
      model,
      latencyMs
    };
  }
};
