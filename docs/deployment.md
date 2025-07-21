# Deployment Guide

## Overview

The Tourism Platform consists of two main applications:
- **CMS** - Deployed to Railway
- **Website Template** - Deployed to Vercel

## Prerequisites

1. Accounts on:
   - Railway (https://railway.app)
   - Vercel (https://vercel.com)
   - PostgreSQL database provider
   - Redis provider (or use Railway's Redis)
   - Clerk (https://clerk.com)
   - Google AI Studio (for Gemini API key)

2. CLI tools:
   - Railway CLI
   - Vercel CLI
   - pnpm

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

### Database & Redis
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Redis connection

### Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard

### AI Services
- `GEMINI_API_KEY` - From Google AI Studio
- `REPLICATE_API_TOKEN` - (Optional) For image generation

### Deployment
- `VERCEL_TOKEN` - From Vercel account settings
- `RAILWAY_TOKEN` - From Railway account settings
- `REVALIDATION_TOKEN` - Generate a secure random token

## Deploying the CMS to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Create a new project:
```bash
railway init
```

4. Add PostgreSQL and Redis services in Railway dashboard

5. Set environment variables in Railway dashboard

6. Deploy:
```bash
railway up
```

## Deploying Website Template to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Navigate to website template:
```bash
cd apps/website-template
```

4. Deploy:
```bash
vercel
```

5. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `REVALIDATION_TOKEN`
   - Any other required variables

6. Configure custom domains in Vercel for wildcard subdomains:
   - Add `*.tourism-platform.com` domain
   - Configure DNS with your provider

## Post-Deployment

1. **Initialize Database**:
```bash
pnpm db:push
pnpm db:seed # If you have seed data
```

2. **Configure Webhooks**:
   - In Vercel: Add webhook endpoint `https://your-cms.railway.app/api/webhooks/vercel`
   - Set `VERCEL_WEBHOOK_SECRET` in CMS environment

3. **Test Deployment**:
   - Create a test site in CMS
   - Generate content
   - Deploy and verify it's accessible

## Monitoring

1. **Railway**:
   - Monitor logs: `railway logs`
   - Check metrics in Railway dashboard

2. **Vercel**:
   - Monitor functions logs
   - Check analytics dashboard

3. **Health Checks**:
   - CMS: `https://your-cms.railway.app/api/health`
   - Website: Check individual site URLs

## Troubleshooting

### CMS Issues
- Check Railway logs: `railway logs`
- Verify all environment variables are set
- Ensure database migrations are run
- Check Redis connection

### Website Issues
- Check Vercel function logs
- Verify DATABASE_URL is accessible
- Check revalidation token matches
- Ensure ISR is working correctly

### Background Jobs
- Monitor BullMQ dashboard (if configured)
- Check Redis connection
- Verify ENABLE_WORKERS is set to true in production

## Scaling

### CMS Scaling
- Railway automatically scales based on usage
- Consider adding more workers for background jobs
- Use Redis clustering for high load

### Website Scaling
- Vercel automatically scales
- Configure ISR cache settings
- Use Vercel Edge Functions for better performance
- Consider using Vercel Edge Config for dynamic configuration

## Security

1. **Environment Variables**:
   - Never commit `.env` files
   - Use strong, unique tokens
   - Rotate keys regularly

2. **Access Control**:
   - Limit Railway and Vercel team access
   - Use deployment environments (staging/production)
   - Enable 2FA on all accounts

3. **Monitoring**:
   - Set up alerts for failed deployments
   - Monitor for unusual traffic patterns
   - Regular security audits