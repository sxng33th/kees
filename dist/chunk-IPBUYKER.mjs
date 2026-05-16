import {
  loadConfig,
  removeProviderKey,
  setProviderKey
} from "./chunk-U4MGNZJZ.mjs";

// src/server/index.ts
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import open from "open";
var fastify = Fastify({ logger: false });
async function startServer(port = 3e3) {
  fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), "public"),
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
      const { setProviderStatus } = await import("./config-VXUTSBQA.mjs");
      setProviderStatus(provider, isActive);
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
      const { setProviderOrder } = await import("./config-VXUTSBQA.mjs");
      setProviderOrder(order);
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
    await open(url);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

export {
  startServer
};
