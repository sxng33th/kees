# Kees Hub 🗝️

**Kees Hub** is a personal AI infrastructure layer. It’s a unified orchestration hub that allows you to connect all your AI resources—APIs, local models, and free-tier access—into one configurable, local-first runtime layer.

## Why Kees?
AI access is fragmented. Developers today juggle OpenAI keys, Gemini balances, Anthropic APIs, and local Ollama models. Every new project requires reconfiguring providers, handling fallbacks, and managing secrets.

Kees solves this by acting as your personal **AI Switchboard**.

## Key Features
- **Unified Interface**: Use one SDK to access OpenAI, Gemini, Anthropic, and OpenRouter.
- **Local-First Security**: Your API keys never leave your machine. They are stored securely in `~/.kees/config.json`.
- **Zero-Boilerplate**: Link Kees once, and every project on your machine shares the same AI infrastructure.
- **Smart Routing**: (Coming Soon) Automatically route tasks to the cheapest or fastest provider available.

## Quick Start

### 1. Install & Link
```bash
# Clone and link the package locally
npm install
npm run build
npm link
```

### 2. Configure Providers
```bash
kees set openrouter <YOUR_KEY>
kees set openai <YOUR_KEY>
```

### 3. Use in any project
```bash
# In your other project
npm link kees
```

```javascript
import { generate } from 'kees';

const response = await generate({
  prompt: "Hello Kees!",
  provider: "openai"
});

console.log(response.text);
```

## Documentation
- **[DOCUMENTATION.md](./.doc/DOCUMENTATION.md)**: Deep dive into architecture and API.
- **[STYLE_GUIDE.md](./.doc/STYLE_GUIDE.md)**: Details on the "Kees Mono" design system.

## License
ISC
