import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try dynamic import of Prisma
    const { prisma } = await import('@tourism/database');
    
    // Try a simple query
    const count = await prisma.site.count();
    
    return NextResponse.json({
      success: true,
      siteCount: count,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name || 'Unknown',
      // Check if it's a Prisma-specific error
      isPrismaError: error instanceof Error && error.message.includes('Prisma'),
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    }, { status: 500 });
  }
}