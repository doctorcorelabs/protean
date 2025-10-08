# Quick Fix Guide

## 🚨 Getting 500 Error on /api/health?

### ✅ Quick Solution (30 seconds)

**Step 1:** Stop your dev server (Ctrl+C in terminal)

**Step 2:** Restart with clean cache
```bash
npm run dev
```

**Step 3:** Look for this line in terminal:
```
🔧 Vite Config - API Target: https://ai-molecular-research.daivanfebrijuansetiya.workers.dev
```

✅ If you see the URL above, you're good!
❌ If you see `http://localhost:8787`, check your `.env` file

---

## 📋 Checklist

### Your `.env` should look like this:
```env
VITE_API_URL=https://ai-molecular-research.daivanfebrijuansetiya.workers.dev
```

### When you start dev server, you should see:
```
🔧 Vite Config - API Target: https://...workers.dev
  ➜  Local:   http://localhost:3000/
```

### When you use the app, browser console should show:
```
📡 Proxying: GET /api/health → https://...workers.dev/api/health
```

---

## 🔧 Common Issues

### Issue 1: "Still getting 500 error"
**Solution:**
1. Verify deployed worker is running:
   ```bash
   curl https://ai-molecular-research.daivanfebrijuansetiya.workers.dev/api/health
   ```
   Should return: `{"status":"healthy"}`

2. If worker is down, deploy it:
   ```bash
   npm run worker:deploy
   ```

### Issue 2: "Says worker not running"
**Solution:**
You're using local worker URL. Either:
- **Option A:** Use deployed worker (recommended)
  ```env
  VITE_API_URL=https://ai-molecular-research.daivanfebrijuansetiya.workers.dev
  ```
  
- **Option B:** Start local worker
  ```bash
  npm run worker:dev
  ```

### Issue 3: "Changed .env but still broken"
**Solution:**
Must restart dev server after changing `.env`:
```bash
# Stop (Ctrl+C)
npm run dev
```

---

## 🎯 What Was Fixed

### Before:
- Vite couldn't read `VITE_API_URL` from `.env`
- Proxy defaulted to `localhost:8787` (local worker)
- Got 500 error because local worker wasn't running

### After:
- Vite properly loads environment variables
- Proxy uses deployed worker by default
- Fallback is also deployed worker (not localhost)
- Works without any local setup

---

## 💡 Pro Tips

### For Normal Development (Frontend Only)
```bash
# Just this!
npm run dev
```
Uses deployed worker automatically. No setup needed!

### For Full Stack Development (Frontend + Backend)
```bash
# Terminal 1
npm run worker:dev

# Terminal 2
# Update .env to: VITE_API_URL=http://localhost:8787
npm run dev
```

### Quick Test Commands
```bash
# Test deployed worker
curl https://ai-molecular-research.daivanfebrijuansetiya.workers.dev/api/health

# Test through proxy
curl http://localhost:3000/api/health
```

---

## 📞 Still Having Issues?

Check these files in order:

1. **`.env`** - Is `VITE_API_URL` set correctly?
2. **Terminal output** - Do you see "🔧 Vite Config - API Target"?
3. **Browser console** - Do you see proxy logs?
4. **Network tab** - What is the actual URL being called?

See `TROUBLESHOOTING.md` for detailed guide.

---

**TL;DR:**
1. Stop dev server
2. Check `.env` has deployed worker URL
3. Start dev server
4. Look for "🔧 Vite Config - API Target" message
5. Should work now! 🎉
