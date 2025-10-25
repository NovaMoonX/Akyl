import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { qrcode } from 'vite-plugin-qrcode';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), qrcode()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase the chunk size warning limit to 1000KB
  },
});
