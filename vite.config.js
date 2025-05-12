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
        'icons/icon-192x192.png',
        'icons/icon-512x512.png'
      ],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico,webmanifest}'],
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
  }
});
