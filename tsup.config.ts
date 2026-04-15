import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // The entrypoint to your SDK
  format: ['cjs', 'esm'],  // Output CommonJS (for older Node) and ESM (for modern Node/browsers)
  dts: true,               // Generate TypeScript definition files (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true,             // Clean the output folder before building
  minify: true,            // Minify the output code
});