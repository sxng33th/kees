import { generate } from '../src/sdk';

async function main() {
  console.log('Testing Kees SDK...');
  
  try {
    const result = await generate({
      prompt: 'What is the capital of France?',
      provider: 'openai',
      systemPrompt: 'You are a helpful assistant.'
    });

    console.log('--- Result ---');
    console.log(`Provider: ${result.provider}`);
    console.log(`Model: ${result.model}`);
    console.log(`Latency: ${result.latencyMs}ms`);
    console.log(`\nResponse:\n${result.text}`);
    console.log('--------------');
  } catch (error) {
    console.error('Test Failed:', error);
  }
}

main();
