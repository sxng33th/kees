import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { loadConfig, setProviderKey, removeProviderKey } from '../core/config';
import open from 'open';

const fastify = Fastify({ logger: false });

export async function startServer(port = 3000) {
  // Register static files
  fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/', 
  });

  // API Endpoints
  fastify.get('/api/config', async () => {
    return loadConfig();
  });

  fastify.post('/api/config', async (request, reply) => {
    const { provider, key } = request.body as { provider: string; key: string };
    if (!provider || !key) {
      return reply.code(400).send({ error: 'Provider and key are required' });
    }
    setProviderKey(provider, key);
    return { success: true };
  });

  fastify.delete('/api/config/:provider', async (request, reply) => {
    const { provider } = request.params as { provider: string };
    try {
      removeProviderKey(provider);
      return { success: true };
    } catch (error: any) {
      return reply.code(404).send({ error: error.message });
    }
  });

  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    const url = `http://localhost:${port}`;
    console.log(`\n🚀 Kees Dashboard running at ${url}`);
    console.log('Press Ctrl+C to stop the server\n');
    
    // Automatically open the browser
    await open(url);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
