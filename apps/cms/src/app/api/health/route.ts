import { NextResponse } from 'next/server';
import { prisma } from '@tourism/database';
import { redis } from '@/lib/queues/config';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
      auth: 'unknown'
    }
  };
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = 'healthy';
  } catch (error) {
    checks.checks.database = 'unhealthy';
    checks.status = 'unhealthy';
  }
  
  try {
    // Check Redis connection
    await redis.ping();
    checks.checks.redis = 'healthy';
  } catch (error) {
    checks.checks.redis = 'unhealthy';
    checks.status = 'unhealthy';
  }
  
  try {
    // Check if Clerk is configured
    if (process.env.CLERK_SECRET_KEY) {
      checks.checks.auth = 'healthy';
    } else {
      checks.checks.auth = 'unconfigured';
    }
  } catch (error) {
    checks.checks.auth = 'unhealthy';
  }
  
  const statusCode = checks.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(checks, { status: statusCode });
}