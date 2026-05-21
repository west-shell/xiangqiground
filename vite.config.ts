import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'tests/public',
  server: {
    port: 3000,
  },
});
