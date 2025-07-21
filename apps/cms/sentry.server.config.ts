import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  
  // Integrations
  integrations: [],
  
  // Filtering
  beforeSend(event, hint) {
    // Add user context
    if (event.user) {
      event.user = {
        ...event.user,
        ip_address: '{{auto}}', // Let Sentry infer IP
      };
    }
    
    return event;
  },
});