import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'Iconodeaplicacion.png',
        'icons/Icono1.png',
        'icons/Icono2.png'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, 
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin.includes('firestore.googleapis.com') ||
              url.origin.includes('firebase.googleapis.com') ||
              url.origin.includes('firebaseio.com'),
            handler: 'NetworkOnly',
            options: {
              cacheName: 'firebase-excluded'
            }
          }
        ]
      }
    })
  ],
  build: {
    minify: 'esbuild',
    target: 'es2017',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-bootstrap')) return 'react-bootstrap';
            if (id.includes('react-icons')) return 'react-icons';
            return 'vendor';
          }
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
  }
});
