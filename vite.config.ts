import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Get API URL from environment, fallback to deployed worker
  const apiUrl = env.VITE_API_URL || 'https://ai-molecular-research.daivanfebrijuansetiya.workers.dev'
  
  console.log('🔧 Vite Config - API Target:', apiUrl)
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('❌ Proxy error:', err.message);
              console.log('📍 Target:', apiUrl);
              console.log('💡 Tip: Make sure Cloudflare Worker is accessible');
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('📡 Proxying:', req.method, req.url, '→', apiUrl + req.url);
            });
          },
        },
      },
    },
  }
})

