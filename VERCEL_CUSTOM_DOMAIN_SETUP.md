# Vercel Custom Domain Setup Guide

This guide explains how to properly set up custom domains for your tourism platform sites.

## Prerequisites

1. Domain purchased and DNS access
2. Site published in CMS with custom domain configured
3. Vercel project deployed

## Step 1: Configure DNS

### For Cloudflare Users

1. Go to your Cloudflare dashboard
2. Add DNS record:
   - **Type**: A
   - **Name**: @ (or your subdomain)
   - **Value**: `76.76.21.21`
   - **Proxy**: **MUST BE DISABLED** (gray cloud, not orange)
   
   ⚠️ **IMPORTANT**: The Cloudflare proxy must be OFF for Vercel to work properly

### For Other DNS Providers

Add one of these records:

**For apex domains (example.com)**:
- Type: A
- Name: @ or blank
- Value: 76.76.21.21

**For subdomains (www.example.com)**:
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

## Step 2: Add Domain to Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Domains
3. Click "Add Domain"
4. Enter your custom domain (e.g., `floral-fantasy-tickets.com`)
5. Vercel will verify the DNS configuration
6. Wait for SSL certificate provisioning (usually 1-10 minutes)

## Step 3: Configure in CMS

1. Log into your CMS
2. Go to Site Settings
3. Enter the custom domain in the "Custom Domain" field
4. Save settings

## Step 4: Verify

1. Wait 5-10 minutes for DNS propagation
2. Visit your custom domain
3. Check for SSL certificate (https should work)

## Troubleshooting

### "Proxy Detected" Error in Vercel
- **Cause**: Cloudflare proxy is enabled
- **Fix**: Turn off the orange cloud in Cloudflare DNS settings

### 404 Error on Custom Domain
- **Cause**: Domain not saved correctly in database
- **Fix**: 
  1. Verify domain is saved in CMS settings
  2. Ensure site is published
  3. Check deployment logs

### 500 Error / DYNAMIC_SERVER_USAGE
- **Cause**: Usually related to deployment issues
- **Fix**: 
  1. Check Vercel deployment logs
  2. Ensure latest code is deployed
  3. Verify environment variables

### SSL Certificate Issues
- **Cause**: DNS not properly configured or propagated
- **Fix**: 
  1. Verify DNS records
  2. Wait up to 48 hours for propagation
  3. Check Vercel domain settings

## Important Notes

1. **One Domain Per Site**: Each site can have one custom domain
2. **SSL Automatic**: Vercel provides SSL certificates automatically
3. **No WWW Redirect**: If you want both www and non-www, add both as separate domains in Vercel
4. **Propagation Time**: DNS changes can take 5 minutes to 48 hours

## Domain Limits

- **Hobby**: 50 domains per project
- **Pro**: 250 domains per project
- **Enterprise**: Custom limits

## Best Practices

1. Always disable Cloudflare proxy for Vercel domains
2. Add both www and non-www versions if needed
3. Test with DNS lookup tools before assuming it's broken
4. Keep track of which domains are assigned to which sites