# Clerk Authentication Setup

## Overview

The CMS uses Clerk for authentication. This provides a complete authentication solution with user management, OAuth providers, and more.

## Setup Instructions

### 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application
3. Choose "Next.js" as your framework

### 2. Get Your API Keys

1. In your Clerk dashboard, go to "API Keys"
2. Copy the following keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 3. Update Environment Variables

Add your Clerk keys to `/apps/cms/.env`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your-key-here"
CLERK_SECRET_KEY="sk_test_your-key-here"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

### 4. Configure Clerk Settings (Optional)

In your Clerk dashboard, you can:

1. **Customize the appearance** of sign-in/sign-up forms
2. **Enable OAuth providers** (Google, GitHub, etc.)
3. **Configure user profile fields**
4. **Set up webhooks** for user events

### 5. Protected Routes

The following routes are protected by authentication:
- `/dashboard` - Main dashboard
- `/sites/*` - Site management
- `/api/trpc/*` - API endpoints
- `/api/sites/*` - Site API
- `/api/generate/*` - Content generation API

### 6. User Management

Users can:
- Sign up with email/password
- Sign in with email/password
- Manage their profile via the UserButton component
- Sign out and be redirected to the sign-in page

## Testing

1. Start the CMS: `pnpm dev`
2. Visit http://localhost:3000
3. Click "Create Account" to sign up
4. After sign up, you'll be redirected to the dashboard
5. Click the user button in the header to manage your account

## Production Deployment

For production:
1. Create a production Clerk application
2. Update your production environment variables
3. Configure your production domain in Clerk dashboard
4. Enable any additional security features needed