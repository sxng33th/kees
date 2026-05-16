#!/usr/bin/env node
import {
  startServer
} from "./chunk-UL4DZ353.mjs";
import {
  loadConfig,
  removeProviderKey,
  setProviderKey
} from "./chunk-EPQVCM2A.mjs";

// src/cli/index.ts
import mri from "mri";
var argv = process.argv.slice(2);
var args = mri(argv);
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
