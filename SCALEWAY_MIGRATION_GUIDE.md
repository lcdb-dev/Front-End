# 🚀 Scaleway Migration Guide - From Vercel to Scaleway

## 📋 Migration Overview

**Client Requirement:** Migrate Astro + Payload CMS from Vercel to Scaleway hosting while maintaining ISR functionality.

## 🔍 Scaleway vs Vercel Comparison

### Vercel (Current)
- ✅ **ISR Built-in**: Native Incremental Static Regeneration
- ✅ **Edge Functions**: Global CDN with serverless functions
- ✅ **Auto-scaling**: Zero configuration scaling
- ✅ **Git Integration**: Automatic deployments
- ❌ **Rate Limits**: Free plan restrictions
- ❌ **Vendor Lock-in**: Vercel-specific features

### Scaleway (Target)
- ✅ **Full Control**: Custom infrastructure setup
- ✅ **Cost Predictable**: Pay for what you use
- ✅ **European Hosting**: GDPR compliant
- ✅ **Flexible**: Choose your stack
- ❌ **Manual Setup**: Infrastructure management required
- ❌ **No Built-in ISR**: Need custom implementation

## 🎯 Migration Feasibility Analysis

### ✅ **ISR on Scaleway: POSSIBLE BUT DIFFERENT**

**Good News:** ISR can work on Scaleway, but requires different architecture.

**Key Changes Needed:**
1. **No Vercel Edge Functions** → Use Scaleway Instances/Kubernetes
2. **Custom ISR Implementation** → Redis/Nginx caching + background jobs
3. **Manual Deployment** → Docker + CI/CD pipelines
4. **Infrastructure Management** → Load balancers, monitoring, scaling

---

## 🏗️ Scaleway Architecture Options

### Option 1: Scaleway Instances (Recommended for ISR)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Payload CMS   │───▶│   MongoDB       │───▶│   Astro App     │
│   (Instance)    │    │   (Scaleway DB) │    │   (Instance)    │
│ • Admin Panel   │    │ • Article Data  │    │ • Nginx + Node  │
│ • Webhook API   │    │ • Categories    │    │ • Redis Cache   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (ISR Cache)   │
                       │ • Page Cache    │
                       │ • Revalidation  │
                       └─────────────────┘
```

### Option 2: Scaleway Kubernetes (Advanced)
```
Kubernetes Cluster
├── Astro Deployment (ISR)
├── Payload CMS Deployment
├── Redis StatefulSet (Cache)
├── Nginx Ingress (Load Balancer)
└── MongoDB (External/Scaleway DB)
```

---

## 📋 Migration Steps

### Phase 1: Infrastructure Setup

#### 1.1 Create Scaleway Account & Resources
```bash
# Required Scaleway Services:
- 2x DEV1-S Instances (Astro + Payload)
- Scaleway Database (MongoDB/PostgreSQL)
- Object Storage (Static assets)
- Load Balancer (Optional)
- Domain (DNS management)
```

#### 1.2 Database Migration
```bash
# Current: MongoDB Atlas
# Target: Scaleway Database OR keep Atlas
# Option: Migrate to Scaleway managed MongoDB for cost savings
```

#### 1.3 Domain & DNS Setup
```bash
# Current: Vercel domains
# Target: Scaleway Domains OR external registrar
# Configure DNS records for both apps
```

### Phase 2: Application Migration

#### 2.1 Astro Application Changes

**Current astro.config.mjs (Vercel):**
```javascript
export default defineConfig({
  output: 'server',
  adapter: vercel({
    isr: {
      expiration: 60 * 60,
    },
  }),
});
```

**New astro.config.mjs (Scaleway):**
```javascript
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'  // Or 'middleware' for custom server
  }),
});
```

**ISR Implementation Changes:**
- Remove Vercel adapter
- Use Node.js adapter
- Implement custom caching with Redis
- Set up background revalidation jobs

#### 2.2 Custom ISR Implementation

**Redis-based ISR Cache:**
```javascript
// src/lib/cache.ts
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });

export async function getCachedPage(slug: string) {
  return await redis.get(`page:${slug}`);
}

export async function setCachedPage(slug: string, html: string, ttl = 3600) {
  await redis.setex(`page:${slug}`, ttl, html);
}

export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}
```

**Background Revalidation:**
```javascript
// src/lib/revalidation.ts
import { setCachedPage, invalidateCache } from './cache';

export async function revalidatePage(slug: string) {
  // Generate fresh page content
  const freshContent = await generatePage(slug);
  await setCachedPage(slug, freshContent);
}

export async function scheduleRevalidation(slug: string, delay = 3600000) {
  // Schedule revalidation in background
  setTimeout(() => revalidatePage(slug), delay);
}
```

#### 2.3 Nginx Configuration for ISR

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # ISR Cache with Redis
    location / {
        # Check Redis cache first
        proxy_pass http://127.0.0.1:3000;
        proxy_cache isr_cache;
        proxy_cache_key $uri;
        proxy_cache_valid 200 1h;
        add_header X-Cache-Status $upstream_cache_status;
    }

    # API routes (no cache)
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache off;
    }
}

# Redis cache zone
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=isr_cache:10m max_size=1g;
```

### Phase 3: Payload CMS Migration

#### 3.1 Database Connection
```javascript
// payload.config.ts
export default buildConfig({
  // Current: MongoDB Atlas
  // New: Scaleway Database OR keep Atlas
  db: mongooseAdapter({
    url: process.env.DATABASE_URI, // Update connection string
  }),
});
```

#### 3.2 Webhook Configuration
```javascript
// Webhook URL changes
hooks: {
  afterChange: [
    async ({ doc }) => {
      // Current: Vercel URL
      // New: Scaleway instance URL
      await fetch(`${SCALeway_ASTRO_URL}/api/payload-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* payload */ })
      });
    }
  ]
}
```

### Phase 4: Deployment & CI/CD

#### 4.1 Docker Configuration

**Astro Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

**Payload Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "serve"]
```

#### 4.2 Docker Compose (Development)
```yaml
version: '3.8'
services:
  astro:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
    depends_on:
      - redis

  payload:
    build: ./payload-admin
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URI=${DATABASE_URI}

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

#### 4.3 CI/CD Pipeline (GitHub Actions)

**GitHub Actions Workflow:**
```yaml
name: Deploy to Scaleway

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and push Docker image
      run: |
        docker build -t scaleway-registry/astro:latest .
        docker push scaleway-registry/astro:latest
    
    - name: Deploy to Scaleway Instance
      run: |
        scw instance server update <server-id> --image scaleway-registry/astro:latest
```

### Phase 5: Monitoring & Optimization

#### 5.1 Monitoring Setup
```bash
# Install monitoring tools
- Prometheus (metrics)
- Grafana (dashboards)
- Nginx access logs
- Redis monitoring
```

#### 5.2 Performance Optimization
- Redis cache tuning
- Nginx optimization
- Database query optimization
- CDN setup (Scaleway Object Storage)

---

## 💰 Cost Comparison

### Vercel (Current)
- **Free Plan:** $0/month
- **Pro Plan:** ~$20/month
- **Rate Limits:** Build minutes, bandwidth
- **ISR:** Included

### Scaleway (Target)
- **DEV1-S Instance:** €2.99/month (Astro)
- **DEV1-S Instance:** €2.99/month (Payload)
- **Database:** €7-15/month (managed)
- **Object Storage:** €0.01/GB/month
- **Load Balancer:** €10/month (optional)
- **Total:** ~€25-30/month

**Verdict:** Similar costs, more control

---

## ⚠️ Challenges & Solutions

### Challenge 1: ISR Implementation
**Problem:** No built-in ISR like Vercel
**Solution:** Redis + background jobs + Nginx caching

### Challenge 2: Scaling
**Problem:** Manual scaling vs Vercel's auto-scaling
**Solution:** Kubernetes cluster or load balancer with multiple instances

### Challenge 3: Deployment Complexity
**Problem:** Manual deployments vs Vercel's git integration
**Solution:** GitHub Actions + Docker + Scaleway CLI

### Challenge 4: Cold Starts
**Problem:** Server instances may have cold starts
**Solution:** Keep-alive scripts or always-on instances

---

## ✅ Migration Checklist

### Pre-Migration
- [ ] Scaleway account setup
- [ ] Domain purchase/transfer
- [ ] Database provisioning
- [ ] DNS configuration

### Code Changes
- [ ] Update astro.config.mjs (remove Vercel adapter)
- [ ] Implement Redis caching layer
- [ ] Update webhook URLs
- [ ] Create Docker configurations
- [ ] Set up CI/CD pipelines

### Infrastructure
- [ ] Provision Scaleway instances
- [ ] Configure security groups
- [ ] Set up monitoring
- [ ] Configure backup strategies

### Testing
- [ ] Local Docker testing
- [ ] Staging environment testing
- [ ] ISR functionality verification
- [ ] Webhook testing
- [ ] Performance testing

### Go-Live
- [ ] Production deployment
- [ ] DNS cutover
- [ ] Monitoring setup
- [ ] Backup verification

---

## 🎯 Final Recommendation

### **YES, Migration is POSSIBLE** ✅

**Same ISR Functionality:** Achievable with custom implementation
**Same Features:** All current features can be maintained
**Better Control:** Full infrastructure control
**Cost Effective:** Similar costs with more flexibility

### Implementation Approach:
1. **Start Simple:** Single instances with Docker
2. **Add Complexity:** Redis caching, Nginx, monitoring
3. **Scale Later:** Kubernetes when needed

### Timeline Estimate:
- **Planning:** 1-2 days
- **Infrastructure:** 2-3 days
- **Code Changes:** 3-5 days
- **Testing:** 2-3 days
- **Migration:** 1 day

**Total: 1-2 weeks**

---

## 🚀 Next Steps

1. **Confirm Requirements:** Client approval for infrastructure approach
2. **Account Setup:** Create Scaleway account and provision resources
3. **Planning Session:** Detailed architecture and timeline
4. **Development:** Code changes and Docker setup
5. **Testing:** Thorough testing before migration
6. **Go-Live:** Production deployment and monitoring

**Ready to proceed?** The migration is definitely feasible and will give you full control over your infrastructure while maintaining all ISR capabilities! 🎉