import { 
  defineConfig, 
  loadEnv 
} from 'vite'

import html from '@rollup/plugin-html'

export default defineConfig({
  root: 'src',
  build: {
    rollupOptions: {
      input: {
        a: 'src/menu.js',
        'b/index': 'src/game/main.js',
      },
      output: {
        dir: 'dist'
      },
      plugins: [
        html({
          include: '**/*.html'
        }),
      ]

    }
  },
  envDir: '../',
  // publicDir: '../public',
  server: {
    open: true,
    host: '0.0.0.0'
  }
})