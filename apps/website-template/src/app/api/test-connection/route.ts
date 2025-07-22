import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
    databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
    timestamp: new Date().toISOString(),
    headers: {
      'x-vercel-deployment-url': process.env.VERCEL_URL || 'not on vercel'
    }
  });
}