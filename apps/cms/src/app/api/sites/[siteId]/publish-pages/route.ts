import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { siteId } = await params;
  
  try {
    // Update all pages to published status
    await prisma.page.updateMany({
      where: { siteId },
      data: { status: 'PUBLISHED' }
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error publishing pages:', error);
    return NextResponse.json(
      { error: 'Failed to publish pages' },
      { status: 500 }
    );
  }
}