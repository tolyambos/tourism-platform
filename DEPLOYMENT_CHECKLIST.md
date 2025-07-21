# Deployment Checklist for Tourism Platform

## Pre-Deployment Setup

### 1. Database Setup
- [ ] Create PostgreSQL database (Railway, Supabase, or Neon)
- [ ] Copy database connection string
- [ ] Run database migrations: `pnpm db:migrate`
- [ ] Seed initial data: `pnpm db:seed`

### 2. External Services
- [ ] Get Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Get Replicate API token from [Replicate](https://replicate.com/account/api-tokens)
- [ ] Set up Cloudinary account and get credentials
- [ ] Set up Redis instance (Upstash recommended for serverless)

### 3. Vercel Account Setup
- [ ] Create Vercel account (Pro plan for custom domains)
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Get Vercel API token from account settings
- [ ] Note your Vercel team ID (if using team account)

## Deployment Steps

### Step 1: Initial Deployment

1. **Login to Vercel CLI**
   ```bash
   vercel login
   ```

2. **Deploy from the root directory**
   ```bash
   vercel
   ```
   - Select the team/account
   - Link to existing project or create new
   - When asked about settings, accept the detected settings

3. **Note the Project ID**
   - Copy the project ID from Vercel dashboard
   - Add to `.env` file as `VERCEL_PROJECT_ID`

### Step 2: Configure Environment Variables

1. **In Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Make sure to set for Production, Preview, and Development

2. **Required Variables**
   ```
   DATABASE_URL
   GOOGLE_GEMINI_API_KEY
   REPLICATE_API_TOKEN
   CLOUDINARY_URL
   REDIS_URL
   ```

### Step 3: Configure Domains

1. **Add Wildcard Domain**
   - In Vercel: Settings → Domains
   - Add `*.yourdomain.com`
   - Configure DNS: CNAME `*.yourdomain.com` → `cname.vercel-dns.com`

2. **Verify Domain**
   ```bash
   tsx scripts/vercel-deploy.ts verify-domain *.yourdomain.com
   ```

### Step 4: Deploy to Production

1. **Production Deployment**
   ```bash
   vercel --prod
   ```

2. **Verify Deployment**
   - Check main domain works
   - Test subdomain routing (e.g., `rome.yourdomain.com`)

## Post-Deployment Configuration

### 1. Database Connection
- [ ] Verify database is accessible from Vercel
- [ ] Check connection pooling settings
- [ ] Enable SSL if required

### 2. Custom Domain Setup
For each tourism site:

1. **Via CMS Interface**
   - Create new site with subdomain
   - Set custom domain if needed

2. **Via Script**
   ```bash
   tsx scripts/vercel-deploy.ts add-domain prahazoo.com
   ```

3. **Configure DNS at Domain Registrar**
   - A record: `@` → `76.76.21.21`
   - AAAA record: `@` → `2606:4700:3030::6815:821`
   - CNAME: `www` → `cname.vercel-dns.com`

### 3. Testing Checklist
- [ ] Main domain loads correctly
- [ ] Subdomain routing works (*.yourdomain.com)
- [ ] Custom domains resolve properly
- [ ] API endpoints are accessible
- [ ] Database queries work
- [ ] Images load from Cloudinary
- [ ] Multi-language routing works

### 4. Performance Optimization
- [ ] Enable Vercel Analytics
- [ ] Set up proper caching headers
- [ ] Configure ISR for dynamic pages
- [ ] Enable image optimization

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check build logs in Vercel
   - Ensure all dependencies are in package.json
   - Verify environment variables are set

2. **Domain Not Working**
   - Wait for DNS propagation (up to 48 hours)
   - Verify DNS records with `dig yourdomain.com`
   - Check domain verification in Vercel

3. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check if database allows connections from Vercel IPs
   - Enable SSL mode in connection string

4. **Subdomain Routing Issues**
   - Check middleware.ts is handling subdomains
   - Verify wildcard domain is configured
   - Test with subdomain parameter: `?subdomain=rome`

## Production Monitoring

1. **Set up monitoring**
   - Enable Vercel Analytics
   - Configure Sentry for error tracking
   - Set up uptime monitoring

2. **Regular maintenance**
   - Monitor database size
   - Check API usage limits
   - Review error logs weekly

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Add custom domain
tsx scripts/vercel-deploy.ts add-domain example.com

# List all domains
tsx scripts/vercel-deploy.ts list-domains

# Check deployment status
vercel ls

# View logs
vercel logs

# Set environment variable
vercel env add DATABASE_URL
```

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

Remember to test everything in a staging environment before going live!