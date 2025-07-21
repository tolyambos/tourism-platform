import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSiteConfig } from '@/lib/api/site';

export async function GET() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    
    // Try to fetch site config to verify database connection
    const siteConfig = await getSiteConfig(host);
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      site: siteConfig ? {
        name: siteConfig.name,
        domain: siteConfig.domain,
        subdomain: siteConfig.subdomain,
        status: siteConfig.status
      } : null
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      },
      { status: 503 }
    );
  }
}