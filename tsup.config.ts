import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/sdk/index.ts',
    cli: 'src/cli/index.ts',
    server: 'src/server/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
});
