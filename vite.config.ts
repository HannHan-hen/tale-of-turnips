import { defineConfig } from 'vite';

// `base` controls the public path of the built assets.
// - Leave as './' for itch.io and most static hosts (relative paths, works in subfolders).
// - For a GitHub Pages *project* site, set VITE_BASE=/your-repo-name/ at build time.
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
