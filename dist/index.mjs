import {
  loadConfig
} from "./chunk-U4MGNZJZ.mjs";

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

// src/core/providers/freemodel.ts
var freemodelAdapter = {
  id: "freemodel",
  async generate(request, apiKey) {
    const startTime = Date.now();
    const model = request.model || "gpt-5.5";
    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push({ role: "user", content: request.prompt });
    const response = await fetch("https://api.freemodel.dev/v1/chat/completions", {
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
      throw new Error(`Freemodel API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    const latencyMs = Date.now() - startTime;
    const text = data.choices?.[0]?.message?.content || "";
    return {
      text,
      provider: "freemodel",
      model,
      latencyMs
    };
  }
};

// src/core/providers/groq.ts
var groqAdapter = {
  id: "groq",
  async generate(request, apiKey) {
    const startTime = Date.now();
    const model = request.model || "llama-3.1-8b-instant";
    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push({ role: "user", content: request.prompt });
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    const latencyMs = Date.now() - startTime;
    const text = data.choices?.[0]?.message?.content || "";
    return {
      text,
      provider: "groq",
      model,
      latencyMs
    };
  }
};

// src/core/providers/together.ts
var togetherAdapter = {
  id: "together",
  async generate(request, apiKey) {
    const startTime = Date.now();
    const model = request.model || "mistralai/Mixtral-8x7B-Instruct-v0.1";
    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push({ role: "user", content: request.prompt });
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
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
      throw new Error(`Together AI API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    const latencyMs = Date.now() - startTime;
    const text = data.choices?.[0]?.message?.content || "";
    return {
      text,
      provider: "together",
      model,
      latencyMs
    };
  }
};

// src/core/providers/ollama.ts
var ollamaAdapter = {
  id: "ollama",
  async generate(request, _apiKey) {
    const startTime = Date.now();
    const model = request.model || "llama3";
    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push({ role: "user", content: request.prompt });
    const response = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
    const data = await response.json();
    const latencyMs = Date.now() - startTime;
    const text = data.choices?.[0]?.message?.content || "";
    return {
      text,
      provider: "ollama",
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
  anthropic: anthropicAdapter,
  freemodel: freemodelAdapter,
  groq: groqAdapter,
  together: togetherAdapter,
  ollama: ollamaAdapter
};
async function generate(request) {
  const config = loadConfig();
  let providerId = request.provider;
  let activeProviders = [];
  if (!providerId) {
    activeProviders = Object.keys(config.providers).filter(
      (key) => config.providers[key] && config.providers[key].apiKey && config.providers[key].isActive !== false
    );
    if (activeProviders.length === 0) {
      throw new Error("No active providers are configured. Use the dashboard to add or enable one.");
    }
    if (config.providerOrder && config.providerOrder.length > 0) {
      activeProviders.sort((a, b) => {
        const idxA = config.providerOrder.indexOf(a);
        const idxB = config.providerOrder.indexOf(b);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
      providerId = activeProviders[0];
    } else {
      providerId = activeProviders.includes("openrouter") ? "openrouter" : activeProviders[0];
    }
  } else {
    const pConfig = config.providers[providerId];
    if (!pConfig || !pConfig.apiKey) {
      throw new Error(`Provider ${providerId} is not configured.`);
    }
    if (pConfig.isActive === false) {
      throw new Error(`Provider ${providerId} is explicitly deactivated. Enable it to use it.`);
    }
    activeProviders = [providerId];
  }
  let lastError = null;
  const safeProviderId = providerId;
  const fallbackList = [safeProviderId, ...activeProviders.filter((p) => p !== safeProviderId)];
  for (const pid of fallbackList) {
    if (!pid) continue;
    const providerConfig = config.providers[pid];
    const adapter = providers[pid];
    if (!adapter || !providerConfig || !providerConfig.apiKey) continue;
    try {
      return await adapter.generate(request, providerConfig.apiKey);
    } catch (error) {
      console.warn(`\u26A0\uFE0F [kees-hub] Failed to generate using ${pid}: ${error.message}`);
      lastError = error;
      if (request.provider) {
        break;
      }
      if (fallbackList.length > 1) {
        console.warn(`\u26A0\uFE0F [kees-hub] Attempting fallback...`);
      }
    }
  }
  throw new Error(`All generation attempts failed. Last error: ${lastError?.message}`);
}
export {
  generate
};
