interface GenerateRequest {
    prompt: string;
    provider?: string;
    model?: string;
    systemPrompt?: string;
}
interface GenerateResponse {
    text: string;
    provider: string;
    model: string;
    latencyMs: number;
}

declare function generate(request: GenerateRequest): Promise<GenerateResponse>;

export { type GenerateRequest, type GenerateResponse, generate };
