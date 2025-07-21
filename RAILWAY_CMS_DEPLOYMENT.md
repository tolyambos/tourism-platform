# Railway CMS Deployment Guide

## Quick Deploy to Railway

### 1. Prerequisites
- Railway account ([railway.app](https://railway.app))
- GitHub repository connected
- PostgreSQL database (can use Neon or Railway's Postgres)

### 2. Deploy via Railway Button (Easiest)

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `tolyambos/tourism-platform`
5. Configure deployment:
   - **Root Directory**: `apps/cms`
   - **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && pnpm build:cms`
   - **Start Command**: `pnpm start:cms`

### 3. Environment Variables for CMS

Add these in Railway:

```env
# Database (use your Neon database URL)
DATABASE_URL=your-neon-database-url-here

# NextAuth
NEXTAUTH_URL=https://your-cms-app.railway.app
NEXTAUTH_SECRET=generate-random-32-char-string

# Google Gemini
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Replicate (for image generation)
REPLICATE_API_TOKEN=your-replicate-token

# Vercel (for auto-deployment)
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-project-id
VERCEL_TEAM_ID=your-team-id

# Redis (optional, for job queues)
REDIS_URL=redis://default:password@host:port

# Public URLs
NEXT_PUBLIC_APP_URL=https://tourism-platform-website-template.vercel.app
NEXT_PUBLIC_CMS_URL=https://your-cms-app.railway.app
```

### 4. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### 5. Get Vercel Tokens
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create new token with full access
3. Get Project ID from Vercel project settings
4. Get Team ID (if using team account)

### 6. After Deployment

Your CMS will be available at: `https://your-app-name.railway.app`

Default login: Set up authentication via environment variables or use Clerk.

## Manual Deployment Steps

If automatic deployment fails:

1. **Fork and modify railway.json**:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd apps/cms && pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "cd apps/cms && pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Connect to Railway CLI**:
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

## Features Available in CMS

Once deployed, you can:
- Create new tourism sites
- Generate content with AI
- Manage multiple sites
- Deploy sites to custom domains
- Track analytics
- Manage templates

## Troubleshooting

### Build Fails
- Check Node version (needs 18+)
- Verify all environment variables
- Check build logs in Railway

### Database Connection Issues
- Use pooler connection for app
- Direct connection for migrations
- Check SSL settings

### Authentication Issues
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set
- Enable cookies in browser

## Next Steps

1. Access your CMS at the Railway URL
2. Create your first tourism site
3. Generate content with AI
4. Add custom domain in Vercel