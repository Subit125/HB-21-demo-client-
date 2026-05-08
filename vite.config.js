import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Azure Table Storage requests → avoids CORS & HTTP/HTTPS mismatch
      '/azure-table': {
        target: 'https://hbplusstorage.table.core.windows.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/azure-table/, ''),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy Error for Azure Table:', err);
          });
        }
      },
      // Proxy Azure Blob Storage requests
      '/azure-blob': {
        target: 'https://hbplusstorage.blob.core.windows.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/azure-blob/, ''),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy Error for Azure Blob:', err);
          });
        }
      },
    },
  },
})
