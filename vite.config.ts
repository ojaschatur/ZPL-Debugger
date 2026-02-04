import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  worker: {
    plugins: () => [
      wasm(),
      topLevelAwait()
    ]
  },
  optimizeDeps: {
    exclude: ['zpl-renderer-js']
  },
  // Ensure local dev runs at root, but production build uses the repo subpath
  base: command === 'serve' ? '/' : '/ZPL-Debugger/',
}))
