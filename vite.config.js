import { 
  defineConfig, 
  // loadEnv 
} from 'vite'

export default defineConfig({
  // root: 'src',
  // envDir: '../',
  // publicDir: '../public',
  server: {
    open: true,
    host: '0.0.0.0'
  },
  build: {
    rollupOptions: {
      input: 'game/main.js',
      output: {
        dir: 'dist'
      },
    },
    // emptyOutDir: true,
    sourcemap: true,
  },
})