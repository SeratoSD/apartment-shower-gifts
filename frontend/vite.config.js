import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['tasty-moles-float.loca.lt'],
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
