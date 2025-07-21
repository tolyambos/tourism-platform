import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry performance monitoring
    Sentry.init({
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
    
    // Custom instrumentation for database queries
    const { prisma } = await import('@tourism/database');
    
    prisma.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;
      
      // Track slow queries
      if (duration > 1000) {
        Sentry.captureMessage(`Slow database query: ${params.model}.${params.action} took ${duration}ms`, 'warning');
      }
      
      return result;
    });
  }
  
  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    await import('../sentry.edge.config');
  }
}