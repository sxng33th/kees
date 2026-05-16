import { loadConfig } from './config';
import { openrouterAdapter } from './providers/openrouter';
import { openaiAdapter } from './providers/openai';
import { geminiAdapter } from './providers/gemini';
import { anthropicAdapter } from './providers/anthropic';
import { freemodelAdapter } from './providers/freemodel';
import { groqAdapter } from './providers/groq';
import { togetherAdapter } from './providers/together';
import { ollamaAdapter } from './providers/ollama';
import { GenerateRequest, GenerateResponse, ProviderAdapter } from './types';

const providers: Record<string, ProviderAdapter> = {
  openrouter: openrouterAdapter,
  openai: openaiAdapter,
  gemini: geminiAdapter,
  anthropic: anthropicAdapter,
  freemodel: freemodelAdapter,
  groq: groqAdapter,
  together: togetherAdapter,
  ollama: ollamaAdapter,
};

export async function generate(request: GenerateRequest): Promise<GenerateResponse> {
  const config = loadConfig();
  
  // Dynamic routing: use requested provider, or pick a configured default
  let providerId = request.provider;
  let activeProviders: string[] = [];
  
  if (!providerId) {
    activeProviders = Object.keys(config.providers).filter(
      (key) => config.providers[key] && config.providers[key]!.apiKey && config.providers[key]!.isActive !== false
    );
    if (activeProviders.length === 0) {
      throw new Error("No active providers are configured. Use the dashboard to add or enable one.");
    }
    
    // Sort by user's custom priority order if it exists
    if (config.providerOrder && config.providerOrder.length > 0) {
      activeProviders.sort((a, b) => {
        const idxA = config.providerOrder!.indexOf(a);
        const idxB = config.providerOrder!.indexOf(b);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
      providerId = activeProviders[0];
    } else {
      // Default fallback if no order is set
      providerId = activeProviders.includes('openrouter') ? 'openrouter' : activeProviders[0];
    }
  } else {
    // Explicit provider requested
    const pConfig = config.providers[providerId];
    if (!pConfig || !pConfig.apiKey) {
      throw new Error(`Provider ${providerId} is not configured.`);
    }
    if (pConfig.isActive === false) {
      throw new Error(`Provider ${providerId} is explicitly deactivated. Enable it to use it.`);
    }
    activeProviders = [providerId]; // Only allow this one to be tried since it was explicitly requested
  }

  // Fallback Routing Engine
  let lastError: Error | null = null;
  const safeProviderId = providerId as string;
  
  // Create a priority list: the chosen provider first, then the remaining active ones
  const fallbackList = [safeProviderId, ...activeProviders.filter(p => p !== safeProviderId)];

  for (const pid of fallbackList) {
    if (!pid) continue;
    const providerConfig = config.providers[pid];
    const adapter = providers[pid];
    
    if (!adapter || !providerConfig || !providerConfig.apiKey) continue;

    try {
      return await adapter.generate(request, providerConfig.apiKey);
    } catch (error: any) {
      console.warn(`⚠️ [kees-hub] Failed to generate using ${pid}: ${error.message}`);
      lastError = error;
      
      // If the user explicitly requested this provider, don't fall back to others
      if (request.provider) {
        break;
      }
      
      if (fallbackList.length > 1) {
          console.warn(`⚠️ [kees-hub] Attempting fallback...`);
      }
    }
  }

  throw new Error(`All generation attempts failed. Last error: ${lastError?.message}`);
}
