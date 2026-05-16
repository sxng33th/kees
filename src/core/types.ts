export interface GenerateRequest {
  prompt: string;
  provider?: string;
  model?: string;
  systemPrompt?: string;
}

export interface GenerateResponse {
  text: string;
  provider: string;
  model: string;
  latencyMs: number;
}

export interface ProviderAdapter {
  id: string;
  generate(request: GenerateRequest, apiKey: string): Promise<GenerateResponse>;
}
