import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const accountName = env.VITE_AZURE_STORAGE_ACCOUNT_NAME || 'hbplusstorage';

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy Azure Table Storage requests → avoids CORS & HTTP/HTTPS mismatch
        '/azure-table': {
          target: `https://${accountName}.table.core.windows.net`,
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
          target: `https://${accountName}.blob.core.windows.net`,
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
  }
})
