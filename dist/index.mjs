import {
  loadConfig
} from "./chunk-EPQVCM2A.mjs";

// src/core/providers/openrouter.ts
var openrouterAdapter = {
  id: "openrouter",
  async generate(request, apiKey) {
    const startTime = Date.now();
    const model = request.model || "openai/gpt-4o-mini";
    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push({ role: "user", content: request.prompt });
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    const latencyMs = Date.now() - startTime;
    const text = data.choices[0]?.message?.content || "";
    return {
      text,
      provider: "openrouter",
      model: data.model || model,
      latencyMs
    };
  }
};

// src/core/providers/openai.ts
var openaiAdapter = {
  id: "openai",
  async generate(request, apiKey) {
    const startTime = Date.now();
    const model = request.model || "gpt-4o-mini";
    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push({ role: "user", content: request.prompt });
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    const latencyMs = Date.now() - startTime;
    const text = data.choices[0]?.message?.content || "";
    return {
      text,
      provider: "openai",
      model: data.model || model,
      latencyMs
    };
  }
};

// src/core/providers/gemini.ts
var geminiAdapter = {
  id: "gemini",
  async generate(request, apiKey) {
    const startTime = Date.now();
    const model = request.model || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const contents = [];
    if (request.systemPrompt) {
    }
    const body = {
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
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    const latencyMs = Date.now() - startTime;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return {
      text,
      provider: "gemini",
      model,
      latencyMs
    };
  }
};

// src/core/providers/anthropic.ts
var anthropicAdapter = {
  id: "anthropic",
  async generate(request, apiKey) {
    const startTime = Date.now();
    const model = request.model || "claude-3-5-sonnet-20241022";
    const messages = [{ role: "user", content: request.prompt }];
    const body = {
      model,
      max_tokens: 4096,
      messages
    };
    if (request.systemPrompt) {
      body.system = request.systemPrompt;
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    const latencyMs = Date.now() - startTime;
    const text = data.content?.[0]?.text || "";
    return {
      text,
      provider: "anthropic",
      model,
      latencyMs
    };
  }
};

// src/core/router.ts
var providers = {
  openrouter: openrouterAdapter,
  openai: openaiAdapter,
  gemini: geminiAdapter,
  anthropic: anthropicAdapter
};
async function generate(request) {
  const config = loadConfig();
  let providerId = request.provider;
  if (!providerId) {
    const configuredProviders = Object.keys(config.providers).filter(
      (key) => config.providers[key] && config.providers[key].apiKey
    );
    if (configuredProviders.length === 0) {
      throw new Error("No providers are configured. Use 'kees set-key <provider> <API_KEY>' to set one.");
    }
    providerId = configuredProviders.includes("openrouter") ? "openrouter" : configuredProviders[0];
  }
  const pid = providerId;
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
export {
  generate
};
