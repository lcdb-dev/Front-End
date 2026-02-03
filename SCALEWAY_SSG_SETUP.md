# 🚀 Pure SSG Scaleway Deployment Setup

## 📋 Prerequisites

### 1. Scaleway Account Setup
1. Go to https://console.scaleway.com/
2. Create account and verify email
3. Add payment method (credit card required)

### 2. Create API Keys
```
Navigation: Organization → API Keys
```
- Create a new API key
- **Save the Access Key and Secret Key** (you'll need them for GitHub secrets)

### 3. Create Object Storage Bucket
```
Navigation: Storage → Object Storage
```
- Click "Create a bucket"
- Name: `astro-static-site`
- Region: `Paris (fr-par)` or your preferred region
- Make it public: Enable "Public access"

### 4. GitHub Repository Setup
1. Create a new GitHub repository (or use existing)
2. Push your Astro code to the repository

---

## 🔐 GitHub Secrets Configuration

### Required Secrets:
```
Navigation: Repository → Settings → Secrets and variables → Actions
```

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `SCW_ACCESS_KEY` | Your Scaleway access key | From API Keys page |
| `SCW_SECRET_KEY` | Your Scaleway secret key | From API Keys page |
| `SCW_PROJECT_ID` | `5fa412d3-3c99-4814-9a21-56ad6278eb5a` | Your project ID |
| `MONGODB_URI` | Your MongoDB connection string | From MongoDB Atlas |

---

## 🔗 Payload CMS Webhook Setup

### 1. Access Payload Admin
- Go to your Payload CMS admin panel
- Login with admin credentials

### 2. Configure Webhooks
```
Navigation: Admin Panel → Collections → Articles → Hooks
```

Add this webhook configuration:

```javascript
// In your Articles collection hooks (payload-admin/src/collections/Articles.ts)

hooks: {
  afterChange: [
    async ({ doc, operation }) => {
      if (operation === 'create' || operation === 'update' || operation === 'delete') {
        console.log(`🔄 Triggering rebuild for article: ${doc.slug}`);

        // Trigger GitHub Actions rebuild
        const response = await fetch('https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches', {
          method: 'POST',
          headers: {
            'Authorization': `token YOUR_GITHUB_TOKEN`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event_type: 'payload-update',
            client_payload: {
              type: 'article',
              id: doc.id,
              slug: doc.slug,
              operation: operation
            }
          })
        });

        if (response.ok) {
          console.log('✅ Rebuild triggered successfully');
        } else {
          console.error('❌ Failed to trigger rebuild:', await response.text());
        }
      }
    }
  ]
}
```

### 3. Create GitHub Personal Access Token
```
GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
```
- Generate new token
- Scopes: `repo`, `workflow`
- **Save the token** (use as `YOUR_GITHUB_TOKEN` above)

---

## 🏗️ Local Testing

### 1. Test Build Locally
```bash
# Install dependencies
npm install

# Test build
npm run build

# Check dist/ folder
ls -la dist/
```

### 2. Test MongoDB Connection
```bash
# Set environment variable
export MONGODB_URI="your-mongodb-connection-string"

# Test build
npm run build
```

---

## 🚀 Deployment Testing

### 1. Manual Deployment Test
```bash
# Push to main branch
git add .
git commit -m "Update for Scaleway SSG deployment"
git push origin main
```

### 2. Check GitHub Actions
```
Navigation: Repository → Actions
```
- Should see "Deploy to Scaleway Object Storage" running
- Check logs for any errors

### 3. Verify Deployment
- Check Scaleway Object Storage bucket has files
- Access site at: `https://astro-static-site.s3.fr-par.scw.cloud`

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Check MongoDB connection
export MONGODB_URI="your-connection-string"
npm run build

# Check for missing environment variables
echo $MONGODB_URI
```

### GitHub Actions Fails
```bash
# Check secrets are set correctly
# Check Scaleway API keys have correct permissions
# Check bucket name matches in workflow
```

### Payload Webhook Fails
```bash
# Check GitHub token has repo scope
# Check repository name/owner in webhook URL
# Check webhook logs in Payload admin
```

---

## 📊 Performance Expectations

### Build Times:
- **100 articles:** 2-3 minutes
- **1000 articles:** 5-8 minutes
- **5000 articles:** 15-25 minutes

### Site Performance:
- **First load:** 50-100ms (CDN)
- **Subsequent loads:** 50-100ms
- **Global coverage:** 200+ edge locations

### Update Speed:
- **Content change:** 2-5 minute rebuild
- **New live content:** Instant via CDN

---

## 💰 Cost Breakdown

| Service | Cost/Month | Description |
|---------|------------|-------------|
| **Scaleway Object Storage** | €0.50 | 10GB storage |
| **CDN** | €1.00 | Global delivery |
| **GitHub Actions** | Free | 2000 min/month |
| **MongoDB Atlas** | €7-15 | Your existing DB |
| **Total** | **€8.50-16.50** | Much cheaper than Vercel! |

---

## 🎯 Next Steps

1. **✅ Setup complete:** All code updated for pure SSG
2. **🔐 Add secrets:** Configure GitHub secrets
3. **🔗 Setup webhooks:** Configure Payload CMS webhooks
4. **🚀 Test deployment:** Push to main branch
5. **📊 Monitor:** Check performance and costs

---

## 📞 Support

If you encounter issues:

1. **Check GitHub Actions logs** for build errors
2. **Verify Scaleway API keys** have correct permissions
3. **Test locally first** with `npm run build`
4. **Check MongoDB connection** is working

---

**Ready to deploy? Just push to main branch and watch the magic happen!** 🎉

**Your site will be live at:** `https://astro-static-site.s3.fr-par.scw.cloud`