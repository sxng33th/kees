import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.kees');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface ProviderConfig {
  apiKey: string;
  isActive?: boolean;
}

export interface KeesConfig {
  providerOrder?: string[];
  providers: {
    openrouter?: ProviderConfig;
    openai?: ProviderConfig;
    gemini?: ProviderConfig;
    anthropic?: ProviderConfig;
    freemodel?: ProviderConfig;
    groq?: ProviderConfig;
    together?: ProviderConfig;
    ollama?: ProviderConfig;
    [key: string]: ProviderConfig | undefined;
  };
}

const DEFAULT_CONFIG: KeesConfig = {
  providers: {}
};

export function loadConfig(): KeesConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    return DEFAULT_CONFIG;
  }
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data) as KeesConfig;
  } catch (error) {
    console.error('Failed to load Kees config', error);
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: KeesConfig) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function setProviderKey(provider: string, key: string) {
  const config = loadConfig();
  const allowed = ['openrouter', 'openai', 'gemini', 'anthropic', 'freemodel', 'groq', 'together', 'ollama'];
  if (allowed.includes(provider)) {
    // Preserve isActive status if it already exists, default to true for new keys
    const current = config.providers[provider];
    config.providers[provider] = { 
      apiKey: key, 
      isActive: current?.isActive !== undefined ? current.isActive : true 
    };
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  saveConfig(config);
}

export function setProviderStatus(provider: string, isActive: boolean) {
  const config = loadConfig();
  if (config.providers[provider]) {
    config.providers[provider]!.isActive = isActive;
    saveConfig(config);
  } else {
    throw new Error(`Cannot set status for unconfigured provider: ${provider}`);
  }
}

export function setProviderOrder(order: string[]) {
  const config = loadConfig();
  config.providerOrder = order;
  saveConfig(config);
}

export function removeProviderKey(provider: string) {
  const config = loadConfig();
  if (config.providers[provider]) {
    delete config.providers[provider];
    saveConfig(config);
  } else {
    throw new Error(`Provider ${provider} is not configured.`);
  }
}
