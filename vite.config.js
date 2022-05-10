import { defineConfig, loadEnv } from 'vite'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist'
  },
  envDir: '../',
  // publicDir: '../public',
  server: {
    open: true,
    host: '0.0.0.0'
  }
})