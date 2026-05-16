import { ProviderAdapter, GenerateRequest, GenerateResponse } from '../types';

export const geminiAdapter: ProviderAdapter = {
  id: 'gemini',
  async generate(request: GenerateRequest, apiKey: string): Promise<GenerateResponse> {
    const startTime = Date.now();
    const model = request.model || 'gemini-2.5-flash';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = [];
    if (request.systemPrompt) {
      // Gemini expects system instructions separately, but for generic prompt passing
      // we can sometimes bundle it or use the system_instruction field.
      // For simplicity in REST, we pass it as a user message or system_instruction if supported.
    }
    
    // We'll append system prompt to the user prompt if present for simplicity in this MVP adapter,
    // or use the proper systemInstruction field.
    const body: any = {
      contents: [{
        role: "user",
        parts: [{ text: request.prompt }]
      }]
    };

    if (request.systemPrompt) {
      body.systemInstruction = {
        role: "system",
        parts: [{ text: request.systemPrompt }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const latencyMs = Date.now() - startTime;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      text,
      provider: 'gemini',
      model,
      latencyMs
    };
  }
};
