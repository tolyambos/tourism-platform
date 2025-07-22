import { NextResponse } from 'next/server';
import { prisma } from '@tourism/database';

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        subdomain: true,
        domain: true,
        status: true,
        name: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({
      count: sites.length,
      sites,
      databaseConnected: true
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      databaseConnected: false
    }, { status: 500 });
  }
}