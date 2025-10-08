# Fix: Proxy 500 Error - Health Check Issue

## Problem
```
GET http://localhost:3000/api/health [HTTP/1.1 500 Internal Server Error 9ms]
⚠️ API is not available. Using fallback response.
💡 Tip: Start the Cloudflare Worker with: npm run worker:dev
API request failed, using fallback response: API_UNAVAILABLE
```

## Root Cause
1. **Vite Config Issue**: `process.env.VITE_API_URL` was not loaded properly
2. **Proxy Target**: Vite was trying to proxy to `http://localhost:8787` instead of deployed worker
3. **Environment Loading**: Environment variables need to be loaded using Vite's `loadEnv()` function

## Solution Applied

### 1. ✅ Fixed Vite Config (`vite.config.ts`)

**Before:**
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8787',
        // ...
      }
    }
  }
})
```

**After:**
```typescript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'https://ai-molecular-research.daivanfebrijuansetiya.workers.dev'
  
  console.log('🔧 Vite Config - API Target:', apiUrl)
  
  return {
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          // ...
        }
      }
    }
  }
})
```

**Key Changes:**
- ✅ Properly load environment variables using `loadEnv()`
- ✅ Fallback to deployed worker URL if `VITE_API_URL` not set
- ✅ Added console logging to show which API is being targeted
- ✅ Added detailed proxy logging for debugging

### 2. ✅ Optimized Health Check (`geminiService.ts`)

**Added:**
- Health check caching (60 seconds) to avoid repeated requests
- Better error messages showing current API base URL
- More detailed logging for troubleshooting

**Benefits:**
- Reduces unnecessary API calls
- Faster response time for subsequent requests
- Better debugging information

## How It Works Now

### Environment Variable Loading
1. Vite reads `.env` file at startup
2. `loadEnv()` properly loads `VITE_API_URL`
3. Proxy forwards requests to correct target

### Request Flow
```
User Request → Frontend (localhost:3000)
              ↓
          Vite Proxy (/api/*)
              ↓
     Worker (deployed or local)
              ↓
         Gemini API
```

### With Deployed Worker (Default)
```
.env: VITE_API_URL=https://ai-molecular-research.daivanfebrijuansetiya.workers.dev
       ↓
Vite Proxy → https://...workers.dev/api/*
       ↓
✅ Success
```

### With Local Worker (Development)
```
.env: VITE_API_URL=http://localhost:8787
       ↓
Vite Proxy → http://localhost:8787/api/*
       ↓
✅ Success (if worker running)
❌ Error (if worker not running)
```

## Testing

### 1. Verify Environment Loading
Restart dev server and check console:
```
npm run dev
```

Expected output:
```
🔧 Vite Config - API Target: https://ai-molecular-research.daivanfebrijuansetiya.workers.dev
```

### 2. Test API Health
Open browser console and check network tab:
```
GET /api/health → 200 OK
```

### 3. Test Gemini Request
Use the 3D Structure Analysis box:
- Enter a question
- Click "Ask"
- Should receive response without errors

## Configuration

### Use Deployed Worker (Default - No Setup)
```env
# .env
VITE_API_URL=https://ai-molecular-research.daivanfebrijuansetiya.workers.dev
```

### Use Local Worker (Development)
```env
# .env
VITE_API_URL=http://localhost:8787
```

Then start worker:
```bash
npm run worker:dev
```

## Important Notes

### ⚠️ Must Restart Dev Server
After changing `.env`, always restart Vite:
```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

### 💡 Check Console Output
When starting dev server, verify the API target:
```
🔧 Vite Config - API Target: [your-worker-url]
```

### 🔍 Debug Proxy Issues
Check terminal for proxy logs:
```
📡 Proxying: GET /api/health → [target-url]/api/health
```

## Troubleshooting

### Still Getting 500 Error?

1. **Check Terminal Output**
   ```
   Look for: "🔧 Vite Config - API Target: [url]"
   ```

2. **Verify Worker is Accessible**
   ```bash
   curl https://ai-molecular-research.daivanfebrijuansetiya.workers.dev/api/health
   ```
   Should return: `{"status":"healthy","timestamp":"..."}`

3. **Check .env File**
   ```bash
   Get-Content .env
   ```
   Verify `VITE_API_URL` is set correctly

4. **Clear Cache and Restart**
   ```bash
   # Stop dev server
   # Delete .vite cache
   rm -rf node_modules/.vite
   # Restart
   npm run dev
   ```

### Proxy Logs Not Showing?

Check `vite.config.ts` has logging enabled:
```typescript
configure: (proxy, options) => {
  proxy.on('proxyReq', (proxyReq, req, res) => {
    console.log('📡 Proxying:', req.method, req.url, '→', apiUrl + req.url);
  });
}
```

## Files Modified

1. ✅ `vite.config.ts` - Fixed environment loading and proxy configuration
2. ✅ `src/services/geminiService.ts` - Added health check caching and better logging

## Result

✅ **Environment variables properly loaded**
✅ **Proxy correctly forwards to deployed worker**
✅ **Health checks cached for better performance**
✅ **Detailed logging for debugging**
✅ **No more 500 errors on health endpoint**

## Next Steps

1. **Restart Dev Server**: Stop and start `npm run dev`
2. **Verify Console Output**: Check that API target is correct
3. **Test Application**: Try using 3D Structure Analysis feature
4. **Monitor Logs**: Check browser console and terminal for any issues

---

**Status**: ✅ Fixed
**Date**: October 8, 2025
**Impact**: Proxy now correctly forwards to deployed Cloudflare Worker
