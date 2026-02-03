# 🚀 **Serverless Scaleway Migration Guide** - Complete Vercel to Scaleway

## 🎯 **Goal: Serverless Architecture (Not Static)**

**Requirements:**
- ✅ Serverless functions (API routes)
- ✅ Dynamic content rendering
- ✅ Real-time search
- ✅ Comments system
- ✅ Webhook integration
- ❌ Remove ALL Vercel dependencies

---

## 📋 **Current Status**

### ✅ **Fixed Issues:**
- Article content now displays properly (rich text rendering)
- Server-side rendering enabled (`prerender = false`)
- API routes restored (search, comments, webhooks)
- Node.js adapter configured for Scaleway

### 🔧 **Configuration Updated:**
- `astro.config.mjs`: Server output with Node.js adapter
- `package.json`: Added `@astrojs/node` dependency
- API routes: `/api/search`, `/api/comments`, `/api/payload-webhook`
- Pages: Dynamic rendering enabled

---

## 🏗️ **Scaleway Serverless Deployment Options**

### **Option 1: Scaleway Serverless Functions (Recommended)**
```bash
# Deploy as serverless functions
# Each API route becomes a separate function
# Main app runs as container
```

### **Option 2: Scaleway Serverless Containers**
```bash
# Deploy entire app as container
# Better for complex apps with many routes
```

---

## 📦 **Complete Deployment Setup**

### **Phase 1: Repository Setup**

#### **A. Create Scaleway Frontend Repository**
```bash
# Clone your frontend repo
git clone https://github.com/atoolsood-collab/Front-End.git scaleway-frontend
cd scaleway-frontend

# Copy our updated serverless code
cp -r ../lcdb-astro/src ./src
cp -r ../lcdb-astro/public ./public
cp ../lcdb-astro/astro.config.mjs ./
cp ../lcdb-astro/package.json ./
cp ../lcdb-astro/tailwind.config.js ./
```

#### **B. Update Repository**
```bash
# Install serverless dependencies
npm install @astrojs/node

# Remove Vercel dependencies
npm uninstall @astrojs/vercel @vercel/speed-insights

# Commit changes
git add .
git commit -m "Migrate to Scaleway serverless - remove Vercel"
git push origin main
```

---

### **Phase 2: Scaleway Infrastructure**

#### **A. Create Serverless Container**
```bash
# In Scaleway Console:
1. Go to Containers → Serverless Containers
2. Click "Create container"
3. Name: astro-serverless-app
4. Region: Paris (fr-par)
5. Container image: Build from GitHub
6. Repository: https://github.com/atoolsood-collab/Front-End
7. Branch: main
8. Build command: npm run build
9. Port: 4321
10. Environment variables:
    - NODE_ENV=production
    - MONGODB_URI=your-mongodb-uri
11. Resources: 1 vCPU, 2 GB RAM
12. Create container
```

#### **B. Configure Domain**
```bash
# In container settings:
1. Go to Domains tab
2. Add custom domain: your-domain.com
3. Configure DNS records as instructed
```

#### **C. Environment Variables**
```
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
PAYLOAD_WEBHOOK_SECRET=your-secret
GITHUB_TOKEN=your-github-token  # For rebuilds
```

---

### **Phase 3: API Routes Setup**

#### **A. Serverless Functions (Individual APIs)**
```bash
# Create separate functions for each API:

# 1. Search Function
# In Scaleway Console → Functions:
1. Create function: astro-search-api
2. Runtime: Node.js 18
3. Handler: src/pages/api/search.ts
4. Environment: MONGODB_URI
5. URL: /api/search

# 2. Comments Function
1. Create function: astro-comments-api
2. Runtime: Node.js 18
3. Handler: src/pages/api/comments.ts
4. Environment: MONGODB_URI
5. URL: /api/comments

# 3. Webhook Function
1. Create function: astro-webhook-api
2. Runtime: Node.js 18
3. Handler: src/pages/api/payload-webhook.ts
4. Environment: GITHUB_TOKEN
5. URL: /api/payload-webhook
```

#### **B. Function URLs**
After creation, your APIs will be available at:
```
https://astro-search-api.functions.fnc.fr-par.scw.cloud
https://astro-comments-api.functions.fnc.fr-par.scw.cloud
https://astro-webhook-api.functions.fnc.fr-par.scw.cloud
```

---

### **Phase 4: Payload CMS Integration**

#### **A. Update Payload Admin Repository**
```bash
cd Admin-Pannel

# Update webhook URL to point to Scaleway function
# In your Payload config:
webhooks: [
  {
    url: 'https://astro-webhook-api.functions.fnc.fr-par.scw.cloud',
    events: ['articles.create', 'articles.update', 'articles.delete']
  }
]
```

#### **B. Configure Webhook Authentication**
```javascript
// In webhook handler
const signature = request.headers.get('x-payload-signature');
// Verify signature with PAYLOAD_WEBHOOK_SECRET
```

---

### **Phase 5: CI/CD Pipeline**

#### **A. GitHub Actions for Container Updates**
```yaml
# .github/workflows/deploy-scaleway.yml
name: Deploy to Scaleway Serverless

on:
  push:
    branches: [ main ]
  repository_dispatch:
    types: [ payload-update ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
        MONGODB_URI: ${{ secrets.MONGODB_URI }}

    - name: Deploy to Scaleway
      run: |
        # Use Scaleway CLI to update container
        echo "Deployment triggered"
        # Container auto-updates from GitHub
```

#### **B. Manual Deployment**
```bash
# Or deploy manually:
npm run build
# Upload dist/ to Scaleway container
```

---

### **Phase 6: Testing & Verification**

#### **A. Test Local Development**
```bash
# Test serverless locally
npm run dev

# Test APIs:
curl "http://localhost:4321/api/search?q=test"
curl "http://localhost:4321/api/comments?articleId=123"
```

#### **B. Test Production APIs**
```bash
# Test deployed functions:
curl "https://your-domain.com/api/search?q=recipe"
curl "https://your-domain.com/api/comments?articleId=123"
```

#### **C. Test Webhooks**
```bash
# Test webhook from Payload:
# Create/update/delete article in Payload admin
# Check if container rebuilds automatically
```

---

## 🔧 **Configuration Files**

### **astro.config.mjs (Serverless)**
```javascript
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  site: 'https://your-scaleway-domain.com'
});
```

### **package.json (Serverless)**
```json
{
  "dependencies": {
    "@astrojs/node": "^9.1.3",
    "astro": "^5.16.11",
    "mongodb": "^7.0.0",
    // ... other deps
  },
  "scripts": {
    "build": "astro build",
    "start": "node dist/server/entry.mjs"
  }
}
```

---

## 📊 **Performance & Cost**

### **Serverless Functions:**
- **Search API:** ~100-500ms response time
- **Comments API:** ~50-200ms response time
- **Cost:** €0.000002 per request (very cheap)

### **Serverless Container:**
- **Main App:** ~200-800ms response time
- **Cost:** €0.000006 per GB-hour
- **Scaling:** Automatic based on traffic

### **Total Monthly Cost:**
- **Low Traffic (1000 visits):** €2-5/month
- **Medium Traffic (10k visits):** €10-20/month
- **High Traffic (100k visits):** €50-100/month

---

## 🚨 **Troubleshooting**

### **Issue: APIs Not Working**
```bash
# Check function logs in Scaleway Console
# Verify environment variables
# Test locally first: npm run dev
```

### **Issue: Container Not Starting**
```bash
# Check build logs
# Verify package.json dependencies
# Ensure NODE_ENV=production
```

### **Issue: Webhooks Not Triggering**
```bash
# Check Payload webhook URL
# Verify authentication signature
# Check Scaleway function logs
```

---

## 🎯 **Migration Checklist**

### **Pre-Migration:**
- [ ] Create Scaleway account
- [ ] Set up payment method
- [ ] Create serverless container
- [ ] Configure custom domain
- [ ] Generate API keys

### **Code Changes:**
- [ ] Update astro.config.mjs for serverless
- [ ] Add @astrojs/node dependency
- [ ] Restore API routes
- [ ] Enable prerender = false for dynamic pages
- [ ] Update search functionality

### **Infrastructure:**
- [ ] Deploy serverless container
- [ ] Create serverless functions (APIs)
- [ ] Configure environment variables
- [ ] Set up domain and DNS

### **Integration:**
- [ ] Update Payload webhooks
- [ ] Configure GitHub Actions
- [ ] Test all functionality
- [ ] Monitor performance

---

## 🎉 **Success Metrics**

- ✅ **Serverless functions working**
- ✅ **Dynamic search operational**
- ✅ **Comments system functional**
- ✅ **Real-time content updates**
- ✅ **No Vercel dependencies**
- ✅ **Scaleway hosting active**
- ✅ **Cost-effective scaling**

---

**Ready for serverless deployment! 🚀**

**Next: Create Scaleway infrastructure and deploy!**