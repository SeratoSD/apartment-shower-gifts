import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    react(),
    imagetools()
  ],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['tasty-moles-float.loca.lt'],
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
