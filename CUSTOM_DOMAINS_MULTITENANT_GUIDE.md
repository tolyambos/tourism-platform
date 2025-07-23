# Multi-Tenant Custom Domains Guide

This guide explains how custom domains work in your multi-tenant tourism platform.

## Architecture Overview

Your platform uses a single Vercel deployment that serves multiple websites based on the domain/subdomain. This is handled by:

1. **Single Deployment**: The `website-template` app is deployed once
2. **Domain Routing**: Middleware checks the hostname and routes to the correct site
3. **Database Lookup**: Each request finds the corresponding site by domain/subdomain

## Setup Requirements

### 1. Configure Wildcard Domain in Vercel

Add a wildcard domain to your Vercel project:
1. Go to your Vercel project settings
2. Navigate to Domains
3. Add `*.tourism-platform.com`
4. This allows all subdomains to work automatically

### 2. Get Your Platform's Domain

Your users will need to point their domains to your platform. Find your platform's domain:
- Default: `your-project.vercel.app`
- Or your custom platform domain if configured

## How Users Add Custom Domains

### For Users:

1. **In the CMS**:
   - Go to Site Settings
   - Enter custom domain (e.g., `www.barcelona-guide.com`)
   - Save settings

2. **Configure DNS** (at their domain registrar):
   
   **For subdomains** (recommended):
   ```
   Type: CNAME
   Name: www
   Value: your-platform.vercel.app
   ```
   
   **For apex domains**:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

3. **Wait for DNS propagation** (usually 5-30 minutes)

## How It Works

1. User visits `www.barcelona-guide.com`
2. DNS points to your platform
3. Your middleware receives the request
4. Middleware extracts hostname: `www.barcelona-guide.com`
5. Database query finds site with `domain: "www.barcelona-guide.com"`
6. Site content is served with the correct data

## Important Notes

### DNS Configuration
- Users must configure DNS at their domain registrar
- CNAME is preferred for subdomains
- A records are needed for apex domains
- SSL certificates are automatically handled by Vercel

### Middleware Logic
Your middleware (`apps/website-template/src/middleware.ts`) already handles:
- Custom domain detection
- Subdomain extraction
- Header setting for site identification

### Database Schema
Sites table has both:
- `subdomain`: For `*.tourism-platform.com` domains
- `domain`: For custom domains

## Limitations

1. **Vercel Limits**:
   - Hobby: 50 domains per project
   - Pro: 250 domains per project
   - Enterprise: Custom limits

2. **SSL Certificates**:
   - Automatically provisioned by Vercel
   - May take a few minutes after DNS configuration

## Troubleshooting

### Domain Not Working

1. **Check DNS propagation**:
   ```bash
   dig www.example.com
   nslookup www.example.com
   ```

2. **Verify in database**:
   - Domain is saved correctly in the site record
   - Site status is PUBLISHED

3. **Check middleware logs**:
   - Verify hostname is being extracted correctly
   - Ensure database query finds the site

### Common Issues

1. **"404 Not Found"**:
   - Domain not in database
   - Site not published
   - DNS not configured correctly

2. **SSL Certificate Error**:
   - Wait 10-15 minutes for Vercel to provision
   - Ensure DNS is pointing correctly

3. **Wrong Site Loading**:
   - Check for duplicate domains in database
   - Verify middleware logic

## Best Practices

1. **Domain Validation**:
   - Validate domain format before saving
   - Check for duplicates
   - Ensure no conflicts with existing subdomains

2. **User Communication**:
   - Provide clear DNS instructions
   - Show domain status in UI
   - Send email confirmations

3. **Monitoring**:
   - Log domain access attempts
   - Track 404s for custom domains
   - Monitor SSL certificate status

## Future Enhancements

Consider implementing:
1. Domain verification before allowing configuration
2. Automatic DNS checking
3. Email notifications when domain is active
4. Domain analytics and traffic monitoring
5. Bulk domain import/export