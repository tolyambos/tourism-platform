import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

// Health check endpoint
export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const { prisma } = await import('@tourism/database');
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis connection
    const { redis } = await import('@/lib/queues/config');
    await redis.ping();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        sentry: Sentry.getCurrentHub().getClient() ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    Sentry.captureException(error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}

// Custom error reporting endpoint
export async function POST(request: NextRequest) {
  try {
    const { error, context, user } = await request.json();
    
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('custom', context);
      }
      
      if (user) {
        scope.setUser(user);
      }
      
      Sentry.captureException(new Error(error.message || 'Custom error'), {
        tags: {
          source: 'frontend',
        }
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to report error' },
      { status: 500 }
    );
  }
}