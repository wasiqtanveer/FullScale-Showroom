import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5180, host: '127.0.0.1' },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        /**
         * Three is the bulk of the payload. Splitting it out means edits to the
         * page's own code do not bust the one big cache entry a repeat visitor
         * already holds.
         */
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion';
          return null;
        },
      },
    },
  },
});
