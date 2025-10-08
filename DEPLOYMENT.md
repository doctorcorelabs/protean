# 🚀 Deployment Guide

This guide will help you deploy the AI-Powered Molecular Research Laboratory Platform to production.

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Cloudflare account
- [ ] Netlify account
- [ ] Git repository set up

## 🔧 Setup Instructions

### 1. Environment Configuration

1. Copy the environment template:
```bash
cp env.example .env
```

2. Update the `.env` file with your configuration:
```env
VITE_API_URL=https://your-worker-subdomain.workers.dev
# VITE_APP_NAME and VITE_APP_VERSION should be set in your Netlify environment variables
```

### 2. Cloudflare Workers Setup

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Update `wrangler.toml` with your subdomain:
```toml
name = "ai-molecular-research"
main = "workers/index.js"
compatibility_date = "2023-12-01"

[env.production]
name = "ai-molecular-research"

[[env.production.routes]]
pattern = "your-subdomain.workers.dev/*"
```

4. Deploy the worker:
```bash
npm run worker:deploy
```

### 3. Netlify Setup

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Update `netlify.toml` with your worker URL:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-subdomain.workers.dev/:splat"
  status = 200
  force = true
```

4. Deploy to Netlify:
```bash
npm run deploy
```

## 🚀 Automated Deployment

### Using Deployment Scripts

#### For Linux/macOS:
```bash
./scripts/deploy.sh --all
```

#### For Windows:
```cmd
scripts\deploy.bat
```

### Manual Deployment Steps

1. **Install Dependencies:**
```bash
npm install
```

2. **Build the Project:**
```bash
npm run build
```

3. **Deploy Cloudflare Worker:**
```bash
npm run worker:deploy
```

4. **Deploy to Netlify:**
```bash
npm run deploy
```

## 🔗 Domain Configuration

### Custom Domain Setup

1. **Netlify Domain:**
   - Go to your Netlify dashboard
   - Navigate to Domain settings
   - Add your custom domain
   - Configure DNS records

2. **Cloudflare Worker Domain:**
   - Go to Cloudflare dashboard
   - Navigate to Workers & Pages
   - Configure custom domain for your worker

### DNS Configuration

Configure your DNS records:

```
Type: CNAME
Name: api (or your preferred subdomain)
Value: your-subdomain.workers.dev
```

## 🔒 Security Configuration

### Environment Variables

Set these in your Netlify dashboard:

- `VITE_API_URL`: Your Cloudflare Worker URL
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Version number

### CORS Configuration

The Cloudflare Worker is configured with CORS headers:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

## 📊 Monitoring & Analytics

### Health Checks

Monitor your deployment:

1. **Frontend Health:**
   - Visit your Netlify URL
   - Check console for errors

2. **Backend Health:**
   - Visit `https://your-worker.workers.dev/api/health`
   - Should return: `{"status": "healthy", "timestamp": "..."}`

### Performance Monitoring

1. **Netlify Analytics:**
   - Enable in Netlify dashboard
   - Monitor page views and performance

2. **Cloudflare Analytics:**
   - View in Cloudflare dashboard
   - Monitor API usage and performance

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Worker Deployment Issues:**
   ```bash
   # Check Wrangler configuration
   wrangler whoami
   wrangler dev
   ```

3. **Netlify Deployment Issues:**
   ```bash
   # Check Netlify configuration
   netlify status
   netlify logs
   ```

### Debug Mode

Enable debug mode by setting:
```env
VITE_ENABLE_DEBUG=true
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to Netlify
        run: npm run deploy
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      
      - name: Deploy Cloudflare Worker
        run: npm run worker:deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 📈 Scaling Considerations

### Performance Optimization

1. **Frontend:**
   - Enable Netlify's CDN
   - Use image optimization
   - Implement lazy loading

2. **Backend:**
   - Monitor Cloudflare Worker limits
   - Implement caching strategies
   - Use Cloudflare's global network

### Cost Management

1. **Netlify:**
   - Monitor bandwidth usage
   - Optimize build times
   - Use appropriate plan

2. **Cloudflare:**
   - Monitor worker invocations
   - Optimize API responses
   - Use appropriate plan

## 🆘 Support

If you encounter issues:

1. Check the logs in both Netlify and Cloudflare dashboards
2. Review the troubleshooting section above
3. Check GitHub issues for known problems
4. Contact support with detailed error information

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Deployment Best Practices](https://create-react-app.dev/docs/deployment/)

---

Happy deploying! 🎉





