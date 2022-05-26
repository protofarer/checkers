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
      input: {
        menu: 'game/index.js',
        game: 'index.js',
      },
      output: {
        dir: 'dist'
      },
    },
    // emptyOutDir: true,
    sourcemap: true,
  },
})