import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.kees');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface KeesConfig {
  providers: {
    openrouter?: { apiKey: string };
    openai?: { apiKey: string };
    gemini?: { apiKey: string };
    anthropic?: { apiKey: string };
    [key: string]: { apiKey: string } | undefined;
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
  if (['openrouter', 'openai', 'gemini', 'anthropic'].includes(provider)) {
    config.providers[provider] = { apiKey: key };
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
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
