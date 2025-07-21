import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';
import { CacheInvalidation } from '@/lib/cache/invalidation';

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { pageId } = await params;
  const updates = await request.json();
  
  try {
    // Get page info for cache invalidation
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { siteId: true, slug: true }
    });
    
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    
    // Update section orders in a transaction
    await prisma.$transaction(
      updates.map((update: { id: string; order: number }) =>
        prisma.section.update({
          where: { id: update.id },
          data: { order: update.order }
        })
      )
    );
    
    // Invalidate caches
    await CacheInvalidation.invalidatePage(page.siteId, pageId, page.slug);

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating section order:', error);
    return NextResponse.json(
      { error: 'Failed to update section order' },
      { status: 500 }
    );
  }
}