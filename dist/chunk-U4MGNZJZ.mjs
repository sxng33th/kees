// src/core/config.ts
import fs from "fs";
import path from "path";
import os from "os";
var CONFIG_DIR = path.join(os.homedir(), ".kees");
var CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
var DEFAULT_CONFIG = {
  providers: {}
};
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return DEFAULT_CONFIG;
  }
  try {
    const data = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load Kees config", error);
    return DEFAULT_CONFIG;
  }
}
function saveConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}
function setProviderKey(provider, key) {
  const config = loadConfig();
  const allowed = ["openrouter", "openai", "gemini", "anthropic", "freemodel", "groq", "together", "ollama"];
  if (allowed.includes(provider)) {
    const current = config.providers[provider];
    config.providers[provider] = {
      apiKey: key,
      isActive: current?.isActive !== void 0 ? current.isActive : true
    };
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  saveConfig(config);
}
function setProviderStatus(provider, isActive) {
  const config = loadConfig();
  if (config.providers[provider]) {
    config.providers[provider].isActive = isActive;
    saveConfig(config);
  } else {
    throw new Error(`Cannot set status for unconfigured provider: ${provider}`);
  }
}
function setProviderOrder(order) {
  const config = loadConfig();
  config.providerOrder = order;
  saveConfig(config);
}
function removeProviderKey(provider) {
  const config = loadConfig();
  if (config.providers[provider]) {
    delete config.providers[provider];
    saveConfig(config);
  } else {
    throw new Error(`Provider ${provider} is not configured.`);
  }
}

export {
  loadConfig,
  saveConfig,
  setProviderKey,
  setProviderStatus,
  setProviderOrder,
  removeProviderKey
};
