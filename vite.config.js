import { defineConfig } from 'vite';

export default defineConfig({
  /**
   * Served from the domain root in development and from /<repo>/ on GitHub
   * Pages, so the workflow passes the prefix in rather than hard-coding it —
   * a literal base here would break `npm run dev` for everyone, and a renamed
   * repository would silently ship a page with dead asset URLs.
   */
  base: process.env.BASE_PATH || '/',
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
