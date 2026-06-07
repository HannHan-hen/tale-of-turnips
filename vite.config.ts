import { defineConfig } from 'vite';

// `base` controls the public path of the built assets.
// - Leave as './' for itch.io and most static hosts (relative paths, works in subfolders).
// - For a GitHub Pages *project* site, set VITE_BASE=/your-repo-name/ at build time.
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    // Phaser is ~1.5 MB minified (≈360 kB gzip) and is the irreducible floor for this engine.
    // Split it into its own chunk so it caches independently of our (small) game code, and
    // raise the warning limit to a value we consciously accept rather than chase a smaller
    // bundle that this stack can't deliver.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: { phaser: ['phaser'] },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
