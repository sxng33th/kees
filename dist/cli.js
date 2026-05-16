#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/core/config.ts
var config_exports = {};
__export(config_exports, {
  loadConfig: () => loadConfig,
  removeProviderKey: () => removeProviderKey,
  saveConfig: () => saveConfig,
  setProviderKey: () => setProviderKey,
  setProviderOrder: () => setProviderOrder,
  setProviderStatus: () => setProviderStatus
});
function loadConfig() {
  if (!import_fs.default.existsSync(CONFIG_FILE)) {
    return DEFAULT_CONFIG;
  }
  try {
    const data = import_fs.default.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load Kees config", error);
    return DEFAULT_CONFIG;
  }
}
function saveConfig(config) {
  if (!import_fs.default.existsSync(CONFIG_DIR)) {
    import_fs.default.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  import_fs.default.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
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
var import_fs, import_path, import_os, CONFIG_DIR, CONFIG_FILE, DEFAULT_CONFIG;
var init_config = __esm({
  "src/core/config.ts"() {
    "use strict";
    import_fs = __toESM(require("fs"));
    import_path = __toESM(require("path"));
    import_os = __toESM(require("os"));
    CONFIG_DIR = import_path.default.join(import_os.default.homedir(), ".kees");
    CONFIG_FILE = import_path.default.join(CONFIG_DIR, "config.json");
    DEFAULT_CONFIG = {
      providers: {}
    };
  }
});

// src/cli/index.ts
var import_mri = __toESM(require("mri"));
init_config();

// src/server/index.ts
var import_fastify = __toESM(require("fastify"));
var import_static = __toESM(require("@fastify/static"));
var import_path2 = __toESM(require("path"));
init_config();
var import_open = __toESM(require("open"));
var fastify = (0, import_fastify.default)({ logger: false });
async function startServer(port = 3e3) {
  fastify.register(import_static.default, {
    root: import_path2.default.join(process.cwd(), "public"),
    prefix: "/"
  });
  fastify.get("/api/config", async () => {
    return loadConfig();
  });
  fastify.post("/api/config", async (request, reply) => {
    const { provider, key } = request.body;
    if (!provider || !key) {
      return reply.code(400).send({ error: "Provider and key are required" });
    }
    setProviderKey(provider, key);
    return { success: true };
  });
  fastify.delete("/api/config/:provider", async (request, reply) => {
    const { provider } = request.params;
    try {
      removeProviderKey(provider);
      return { success: true };
    } catch (error) {
      return reply.code(404).send({ error: error.message });
    }
  });
  fastify.patch("/api/config/:provider/status", async (request, reply) => {
    const { provider } = request.params;
    const { isActive } = request.body;
    try {
      const { setProviderStatus: setProviderStatus2 } = await Promise.resolve().then(() => (init_config(), config_exports));
      setProviderStatus2(provider, isActive);
      return { success: true };
    } catch (error) {
      return reply.code(400).send({ error: error.message });
    }
  });
  fastify.put("/api/config/order", async (request, reply) => {
    const { order } = request.body;
    if (!Array.isArray(order)) {
      return reply.code(400).send({ error: "Order must be an array of strings" });
    }
    try {
      const { setProviderOrder: setProviderOrder2 } = await Promise.resolve().then(() => (init_config(), config_exports));
      setProviderOrder2(order);
      return { success: true };
    } catch (error) {
      return reply.code(400).send({ error: error.message });
    }
  });
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    const url = `http://localhost:${port}`;
    console.log(`
\u{1F680} Kees Dashboard running at ${url}`);
    console.log("Press Ctrl+C to stop the server\n");
    await (0, import_open.default)(url);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// src/cli/index.ts
var argv = process.argv.slice(2);
var args = (0, import_mri.default)(argv);
var command = args._[0];
if (command === "set-key" || command === "set" || command === "add") {
  const provider = args._[1];
  const key = args._[2];
  if (!provider || !key) {
    console.error("Usage: kees set <provider> <key>");
    process.exit(1);
  }
  try {
    setProviderKey(provider, key);
    console.log(`Successfully set API key for ${provider}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
} else if (command === "list" || command === "ls") {
  const config = loadConfig();
  console.log("\nKees Configuration:");
  console.log("-------------------");
  const providers = Object.keys(config.providers);
  if (providers.length === 0) {
    console.log("No providers configured.");
  } else {
    providers.forEach((p) => {
      const key = config.providers[p]?.apiKey;
      const maskedKey = key ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : "N/A";
      console.log(`${p}: ${maskedKey}`);
    });
  }
  console.log("");
} else if (command === "remove" || command === "rm") {
  const provider = args._[1];
  if (!provider) {
    console.error("Usage: kees remove <provider>");
    process.exit(1);
  }
  try {
    removeProviderKey(provider);
    console.log(`Successfully removed API key for ${provider}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
} else if (command === "dashboard" || command === "ui") {
  startServer();
} else {
  console.log(`
Kees CLI - Personal AI Infrastructure

Usage:
  kees set <provider> <key>    Set API key for a provider
  kees list                    List configured providers and keys
  kees remove <provider>       Remove API key for a provider
  kees dashboard               Open the web dashboard (alias: ui)
`);
}
