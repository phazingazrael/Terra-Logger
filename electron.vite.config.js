import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  publicDir: false,
  main: {
    build: {
      outDir: 'out/main',
      minify: false,
      emptyOutDir: true,
      sourcemap: true,
      target: 'node16',
      extraResources: ['build/include/**/*']
    }
  },
  preload: {
    build: {
      outDir: 'out/preload'
    }
  },
  renderer: {
    build: {
      outDir: 'out/renderer'
    },
    plugins: [react()]
  },
  server: {
    port: 3000
  },
  clearScreen: true
})
