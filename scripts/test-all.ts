import { generate } from '../src/sdk';
import { loadConfig } from '../src/core/config';

async function testAll() {
  console.log('Testing Kees Hub Providers...\n');
  
  const config = loadConfig();
  const configuredProviders = Object.keys(config.providers).filter(
    (key) => config.providers[key] && config.providers[key]!.apiKey
  );

  if (configuredProviders.length === 0) {
    console.log('No providers configured. Please configure at least one using the dashboard or CLI.');
    return;
  }

  console.log(`Found ${configuredProviders.length} configured providers: ${configuredProviders.join(', ')}\n`);

  for (const provider of configuredProviders) {
    console.log(`[TESTING] ${provider}...`);
    try {
      const result = await generate({
        prompt: 'Respond with exactly one word: "Success".',
        provider: provider,
      });
      console.log(`✅ [${provider}] Success! Latency: ${result.latencyMs}ms. Response: "${result.text}"`);
    } catch (error: any) {
      console.log(`❌ [${provider}] Failed! Error: ${error.message}`);
    }
    console.log('---');
  }
}

testAll();
