# Custom Domains Configuration Guide

This guide explains how to set up automatic custom domain management for your tourism platform.

## Overview

The platform now supports automatic custom domain configuration through Vercel's API. When users add a custom domain in the CMS, it will automatically:

1. Add the domain to your Vercel project
2. Show DNS configuration instructions
3. Monitor domain verification status
4. Handle domain removal when changed

## Setup

### 1. Get Vercel API Credentials

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token with appropriate permissions
3. Copy the token value

### 2. Get Your Project ID

1. Go to your Vercel project dashboard
2. Navigate to Settings → General
3. Copy the Project ID

### 3. Configure Environment Variables

Add these to your CMS app's `.env` file:

```env
# Vercel API Configuration
VERCEL_API_TOKEN="your-vercel-api-token"
VERCEL_PROJECT_ID="your-project-id"
VERCEL_TEAM_ID="your-team-id" # Optional, only if using Vercel Teams
```

## How It Works

### For Users

1. Users go to Site Settings in the CMS
2. Enter their custom domain (e.g., `www.example.com`)
3. Save the settings
4. The domain is automatically added to Vercel
5. DNS configuration instructions are displayed
6. Domain verification status is shown in real-time

### DNS Configuration

The system automatically detects the domain type and provides appropriate DNS instructions:

- **Apex domains** (e.g., `example.com`): A record pointing to `76.76.21.21`
- **Subdomains** (e.g., `www.example.com`): CNAME record pointing to `cname.vercel-dns.com`

### Behind the Scenes

1. When a domain is added/changed in settings, the `updateSiteSettings` action:
   - Checks if the domain changed
   - Removes the old domain from Vercel (if exists)
   - Adds the new domain to Vercel
   - Updates the database

2. The `DomainStatus` component:
   - Checks domain verification status
   - Shows appropriate status messages
   - Displays DNS configuration instructions

## Limitations

- Each Vercel project can have up to 50 custom domains (Hobby plan)
- DNS propagation can take up to 48 hours
- SSL certificates are automatically provisioned by Vercel once DNS is configured

## Troubleshooting

### Domain Not Verifying

1. Check DNS records are correctly configured
2. Wait for DNS propagation (up to 48 hours)
3. Use the verification tool in Vercel dashboard

### API Errors

1. Verify your API token has correct permissions
2. Check the project ID is correct
3. Ensure you haven't hit Vercel's API rate limits

### Domain Already Exists

If a domain shows as already existing, it might be:
- Added to another Vercel project
- Still associated with a previous deployment

Solution: Remove it from the other project or contact Vercel support.

## Security Considerations

- API tokens are server-side only
- Domain changes require authentication
- All domain operations are logged
- Failed operations don't affect site functionality

## Future Enhancements

Potential improvements for the domain management system:

1. Automatic DNS verification checks
2. Webhook notifications for domain status changes
3. Bulk domain management
4. Custom SSL certificate support
5. Domain analytics integration