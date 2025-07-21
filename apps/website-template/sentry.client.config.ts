import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0, // Lower rate for website
  
  // Session Replay
  replaysSessionSampleRate: 0.05, // Lower rate for website
  replaysOnErrorSampleRate: 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true, // Privacy for public website
      blockAllMedia: false,
    }),
  ],
  
  // Filtering
  beforeSend(event, hint) {
    // Filter out non-error events in development
    if (process.env.NODE_ENV === 'development' && event.level !== 'error') {
      return null;
    }
    
    // Filter out bot errors
    const userAgent = event.request?.headers?.['user-agent'];
    if (userAgent && /bot|crawler|spider/i.test(userAgent)) {
      return null;
    }
    
    return event;
  },
});