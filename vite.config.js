import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    target: 'es2017',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-bootstrap')) return 'react-bootstrap'
            if (id.includes('react-icons')) return 'react-icons'
            return 'vendor'
          }
        },
      },
    },
  },
})
