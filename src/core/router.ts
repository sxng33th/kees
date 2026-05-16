import { loadConfig } from './config';
import { openrouterAdapter } from './providers/openrouter';
import { openaiAdapter } from './providers/openai';
import { geminiAdapter } from './providers/gemini';
import { anthropicAdapter } from './providers/anthropic';
import { GenerateRequest, GenerateResponse, ProviderAdapter } from './types';

const providers: Record<string, ProviderAdapter> = {
  openrouter: openrouterAdapter,
  openai: openaiAdapter,
  gemini: geminiAdapter,
  anthropic: anthropicAdapter,
};

export async function generate(request: GenerateRequest): Promise<GenerateResponse> {
  const config = loadConfig();
  
  // Dynamic routing: use requested provider, or pick a configured default
  let providerId = request.provider;
  
  if (!providerId) {
    const configuredProviders = Object.keys(config.providers).filter(
      (key) => config.providers[key] && config.providers[key]!.apiKey
    );
    if (configuredProviders.length === 0) {
      throw new Error("No providers are configured. Use 'kees set-key <provider> <API_KEY>' to set one.");
    }
    // Prefer openrouter as default if available
    providerId = configuredProviders.includes('openrouter') ? 'openrouter' : configuredProviders[0];
  }

  const pid = providerId as string;
  const providerConfig = config.providers[pid];
  
  if (!providerConfig || !providerConfig.apiKey) {
    throw new Error(`Provider ${pid} is not configured. Use 'kees set-key ${pid} <API_KEY>' to set it.`);
  }

  const adapter = providers[pid];
  if (!adapter) {
    throw new Error(`Provider adapter for ${pid} not found.`);
  }

  try {
    return await adapter.generate(request, providerConfig.apiKey);
  } catch (error) {
    console.error(`Failed to generate using ${pid}:`, error);
    throw error;
  }
}
