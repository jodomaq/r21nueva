import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    hmr: { host: '192.168.68.118' }
  },
  plugins: [react()]
});