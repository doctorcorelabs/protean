# Troubleshooting Guide

## Common Issues and Solutions

### 1. API Connection Error (ECONNREFUSED)

**Error Message:**
```
[vite] http proxy error: /api/gemini/3dviewer
AggregateError [ECONNREFUSED]
API request failed: 500
```

**Cause:**
The frontend is trying to connect to a backend API that is not running or not accessible.

**Solutions:**

#### Option A: Use Deployed Cloudflare Worker (Recommended)
1. Check your `.env` file:
   ```env
   VITE_API_URL=https://ai-molecular-research.daivanfebrijuansetiya.workers.dev
   ```
2. Restart the dev server:
   ```bash
   npm run dev
   ```

#### Option B: Run Local Cloudflare Worker
1. Start the worker in a separate terminal:
   ```bash
   npm run worker:dev
   ```
2. Update `.env` to use local worker:
   ```env
   VITE_API_URL=http://localhost:8787
   ```
3. Restart the dev server:
   ```bash
   npm run dev
   ```

#### Option C: Use Helper Script (Windows)
```bash
npm run dev:setup
```
This will guide you through the setup process.

---

### 2. Worker Not Starting Locally

**Error Message:**
```
✘ [ERROR] Could not connect to Cloudflare
```

**Solutions:**
1. Make sure you're logged in to Wrangler:
   ```bash
   wrangler login
   ```

2. Check if you have the required dependencies:
   ```bash
   npm install
   ```

3. Verify `wrangler.toml` configuration

---

### 3. API Returns 500 Error

**Possible Causes:**
- Missing `GEMINI_API_KEY` in worker environment
- Invalid API key
- Gemini API quota exceeded

**Solutions:**

#### For Local Development:
1. Create `.dev.vars` file in the root directory:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

2. Get API key from: https://makersuite.google.com/app/apikey

3. Restart worker:
   ```bash
   npm run worker:dev
   ```

#### For Production:
1. Set secret in Cloudflare dashboard:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```

2. Or via dashboard: Workers & Pages > Your Worker > Settings > Variables

---

### 4. Fallback Response Showing

**Message:**
```
⚠️ API Connection Issue
The backend API is currently unavailable.
```

**This means:**
The frontend detected the API is not available and is showing a fallback response.

**Solutions:**
Follow steps in **Issue #1** above.

---

### 5. CORS Errors

**Error Message:**
```
Access to fetch at '...' has been blocked by CORS policy
```

**Solutions:**
1. Make sure the worker is configured with CORS headers (already included)
2. Check Netlify redirects in `netlify.toml`
3. Verify API URL doesn't have trailing slash

---

### 6. Build Errors

**TypeScript Errors:**
```bash
# Fix TypeScript errors
npm run build
```

**Missing Dependencies:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Development Workflow

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure .env (already done if .env exists)
# Check that VITE_API_URL points to deployed worker

# 3. Start development
npm run dev
```

### Working on Backend
```bash
# Terminal 1: Start worker
npm run worker:dev

# Terminal 2: Start frontend with local worker
# Update .env: VITE_API_URL=http://localhost:8787
npm run dev
```

### Full Stack Development
```bash
# Use helper script (Windows)
npm run dev:setup
```

---

## Deployment Issues

### Netlify Deployment

**Issue:** API calls fail in production

**Solution:**
1. Update `netlify.toml` redirect to your worker URL:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-worker.workers.dev/api/:splat"
   ```

2. Verify worker is deployed and accessible:
   ```bash
   curl https://your-worker.workers.dev/api/health
   ```

### Cloudflare Worker Deployment

**Issue:** Worker not deploying

**Solutions:**
1. Check `wrangler.toml` configuration
2. Verify account_id and route settings
3. Make sure you're logged in:
   ```bash
   wrangler whoami
   ```

---

## Verification Commands

### Check API Health
```bash
# Test deployed worker
curl https://ai-molecular-research.daivanfebrijuansetiya.workers.dev/api/health

# Test local worker
curl http://localhost:8787/api/health
```

### Check Environment Variables
```bash
# Show current env vars (Windows)
Get-Content .env

# Show current env vars (Linux/Mac)
cat .env
```

---

## Need More Help?

1. Check the browser console for detailed error messages
2. Check the terminal where worker is running for backend errors
3. Verify all services are running:
   - Frontend: http://localhost:3000
   - Worker (local): http://localhost:8787
   - Worker (deployed): https://your-worker.workers.dev

## Contact

For additional support, please check the documentation or create an issue.
