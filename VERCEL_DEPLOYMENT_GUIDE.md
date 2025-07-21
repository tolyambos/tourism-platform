# Vercel Deployment Guide for Multi-Tenant Tourism Platform

## Overview
This guide will help you deploy your tourism platform to Vercel with full multi-tenant support, enabling you to create thousands of tourism websites (like prahazoo.com, rometickets.com) each with their own custom domain.

## Prerequisites
- Vercel account with Pro or Enterprise plan (required for custom domains)
- PostgreSQL database (Railway or Supabase recommended)
- Environment variables ready
- Domain names for your tourism sites

## Step 1: Initial Vercel Setup

### 1.1 Connect to GitHub
1. Push your code to GitHub (if not already done)
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository

### 1.2 Configure the Project
When importing, use these settings:
- **Framework Preset**: Next.js
- **Root Directory**: `apps/website-template`
- **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && pnpm build:website`
- **Output Directory**: `.next`
- **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`

## Step 2: Environment Variables

Add these environment variables in Vercel dashboard:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth (if using authentication)
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google Gemini API
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"

# Replicate API (for image generation)
REPLICATE_API_TOKEN="your-replicate-token"

# Storage (if using external storage)
CLOUDINARY_URL="your-cloudinary-url"
# or
AWS_S3_BUCKET="your-s3-bucket"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="your-region"

# Redis (for caching - optional but recommended)
REDIS_URL="your-redis-url"

# Sentry (for error tracking - optional)
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
```

## Step 3: Multi-Tenant Configuration

### 3.1 Wildcard Domain Setup
1. In Vercel project settings → Domains
2. Add wildcard domain: `*.tourism-platform.com`
3. Configure DNS:
   - Add CNAME record: `*.tourism-platform.com` → `cname.vercel-dns.com`

### 3.2 Custom Domain Setup
For each tourism website:
1. In your CMS, create a new site with subdomain
2. In Vercel → Project Settings → Domains
3. Add the custom domain (e.g., `prahazoo.com`)
4. Configure DNS at domain registrar:
   - A record: `@` → `76.76.21.21`
   - AAAA record: `@` → `2606:4700:3030::6815:821`
   - CNAME record: `www` → `cname.vercel-dns.com`

## Step 4: Deployment Scripts

Create deployment helper scripts:

### 4.1 Auto-deploy Script
Create `scripts/deploy-site.ts`:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DeployOptions {
  siteId: string;
  domain: string;
  subdomain: string;
}

export async function deploySite(options: DeployOptions) {
  try {
    // Trigger Vercel deployment
    const deploymentUrl = await triggerVercelDeploy();
    
    // Add custom domain to Vercel
    await addCustomDomain(options.domain);
    
    // Update database with deployment info
    await updateDeploymentStatus(options.siteId, deploymentUrl);
    
    return { success: true, url: deploymentUrl };
  } catch (error) {
    console.error('Deployment failed:', error);
    return { success: false, error };
  }
}

async function triggerVercelDeploy() {
  // Use Vercel API to trigger deployment
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'tourism-platform',
      gitSource: {
        type: 'github',
        repoId: process.env.GITHUB_REPO_ID,
        ref: 'main',
      },
    }),
  });
  
  const data = await response.json();
  return data.url;
}

async function addCustomDomain(domain: string) {
  // Add domain via Vercel API
  const response = await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domain }),
  });
  
  return response.json();
}
```

### 4.2 Domain Management Script
Create `scripts/manage-domains.ts`:

```typescript
export async function addDomainToVercel(domain: string, projectId: string) {
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/domains`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domain,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to add domain: ${response.statusText}`);
  }

  return response.json();
}

export async function verifyDomain(domain: string, projectId: string) {
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}/verify`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    }
  );

  return response.json();
}
```

## Step 5: Database Configuration

### 5.1 Multi-tenant Schema
Ensure your database schema supports multi-tenancy:

```prisma
model Site {
  id               String    @id @default(cuid())
  name             String
  subdomain        String    @unique
  domain           String?   @unique
  type             SiteType
  status           SiteStatus
  languages        String[]
  defaultLanguage  String    @default("en")
  theme            Json
  features         Json
  seoSettings      Json
  deployments      Deployment[]
  pages            Page[]
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model Deployment {
  id            String   @id @default(cuid())
  siteId        String
  site          Site     @relation(fields: [siteId], references: [id])
  url           String
  status        String
  environment   String
  createdAt     DateTime @default(now())
}
```

## Step 6: Performance Optimization

### 6.1 Edge Configuration
Update `next.config.js`:

```javascript
module.exports = {
  experimental: {
    runtime: 'edge',
  },
  images: {
    domains: ['your-image-domains.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### 6.2 Caching Strategy
Implement proper caching headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate=300"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=3600, stale-while-revalidate=86400"
        }
      ]
    }
  ]
}
```

## Step 7: Monitoring & Analytics

### 7.1 Vercel Analytics
Enable in your app:

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 7.2 Custom Domain Analytics
Track domain-specific metrics:

```typescript
export function trackDomainMetrics(domain: string, event: string) {
  // Send to your analytics service
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ domain, event, timestamp: Date.now() }),
  });
}
```

## Step 8: Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Database migrations run
- [ ] Wildcard domain configured
- [ ] SSL certificates active
- [ ] Edge functions deployed
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Performance metrics baseline established
- [ ] Backup strategy in place

## Step 9: CLI Commands for Management

Add these to your CMS for easy management:

```typescript
// Add domain to site
async function addDomainToSite(siteId: string, domain: string) {
  // Update database
  await prisma.site.update({
    where: { id: siteId },
    data: { domain },
  });
  
  // Add to Vercel
  await addDomainToVercel(domain, process.env.VERCEL_PROJECT_ID);
}

// Deploy specific site
async function deploySite(siteId: string) {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  
  if (!site) throw new Error('Site not found');
  
  return deploySite({
    siteId,
    domain: site.domain || `${site.subdomain}.tourism-platform.com`,
    subdomain: site.subdomain,
  });
}
```

## Troubleshooting

### Domain not working
1. Check DNS propagation: `dig yourdomain.com`
2. Verify in Vercel dashboard
3. Check middleware is handling domain correctly

### 404 errors
1. Ensure site is published in database
2. Check middleware subdomain extraction
3. Verify page exists for the route

### Performance issues
1. Enable Vercel Edge Runtime
2. Implement proper caching headers
3. Use ISR for dynamic content
4. Optimize images with next/image

## Next Steps

1. Deploy your platform following this guide
2. Test with a subdomain first
3. Add your first custom domain
4. Monitor performance and errors
5. Scale as needed

For automated deployments from your CMS, implement the deployment API endpoints in your CMS application that trigger Vercel deployments when sites are created or updated.