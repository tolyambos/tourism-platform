import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      server: 'healthy',
      database: 'unknown',
      redis: 'unknown',
      auth: 'unknown'
    }
  };
  
  // During initial startup, allow health checks to pass even if database isn't ready
  const startupGracePeriod = 30000; // 30 seconds
  const serverStartTime = process.env.SERVER_START_TIME ? parseInt(process.env.SERVER_START_TIME) : Date.now();
  const isStartingUp = Date.now() - serverStartTime < startupGracePeriod;
  
  try {
    // Check database connection with timeout
    const { prisma } = await import('@tourism/database');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    );
    
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      timeoutPromise
    ]);
    
    checks.checks.database = 'healthy';
  } catch (error) {
    checks.checks.database = 'unhealthy';
    // Only mark as unhealthy after startup grace period
    if (!isStartingUp) {
      checks.status = 'degraded';
    }
    console.error('Database health check failed:', error);
  }
  
  try {
    // Check Redis connection - optional for Railway deployment
    if (process.env.REDIS_HOST || process.env.REDIS_URL) {
      const { redis } = await import('@/lib/queues/config');
      await redis.ping();
      checks.checks.redis = 'healthy';
    } else {
      checks.checks.redis = 'not_configured';
    }
  } catch (error) {
    checks.checks.redis = 'unhealthy';
    // Redis is optional, don't affect overall health
    console.error('Redis health check failed:', error);
  }
  
  try {
    // Check if Clerk is configured
    if (process.env.CLERK_SECRET_KEY) {
      checks.checks.auth = 'healthy';
    } else {
      checks.checks.auth = 'unconfigured';
      // If auth is not configured and we're not starting up, mark as unhealthy
      if (!isStartingUp && process.env.NODE_ENV === 'production') {
        checks.status = 'unhealthy';
      }
    }
  } catch (error) {
    checks.checks.auth = 'unhealthy';
    console.error('Auth health check failed:', error);
  }
  
  // Always return 200 during startup to allow Railway to proceed
  const statusCode = isStartingUp ? 200 : (checks.status === 'healthy' ? 200 : 503);
  
  return NextResponse.json(checks, { status: statusCode });
}