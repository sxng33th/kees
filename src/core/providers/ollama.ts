import { ProviderAdapter, GenerateRequest, GenerateResponse } from '../types';

export const ollamaAdapter: ProviderAdapter = {
  id: 'ollama',
  async generate(request: GenerateRequest, _apiKey: string): Promise<GenerateResponse> {
    const startTime = Date.now();
    const model = request.model || 'llama3';

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    // Ollama runs locally, so we don't strictly need an API key, but we'll use the OpenAI compatible endpoint
    const response = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error (${response.status}): Make sure Ollama is running locally. ${errorText}`);
    }

    const data = await response.json() as any;
    const latencyMs = Date.now() - startTime;
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      provider: 'ollama',
      model,
      latencyMs
    };
  }
};
