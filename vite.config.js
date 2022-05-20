import { defineConfig, loadEnv } from 'vite'
import resolve from 'resolve'

export default defineConfig({
  root: 'src',
  build: {
    rollupOptions: {
      input: {
        a: 'src/menu.js',
        'b/index': 'src/main.js',
      },
      output: 'dist'

    }
  },
  envDir: '../',
  // publicDir: '../public',
  server: {
    open: true,
    host: '0.0.0.0'
  }
})