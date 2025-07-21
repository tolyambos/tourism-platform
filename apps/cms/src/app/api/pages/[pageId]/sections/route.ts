import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';
import { CacheInvalidation } from '@/lib/cache/invalidation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { pageId } = await params;
  const { templateId, order } = await request.json();
  
  try {
    // Get page info for cache invalidation
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { siteId: true, slug: true }
    });
    
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    
    // Create new section
    const section = await prisma.section.create({
      data: {
        pageId,
        templateId,
        order
      },
      include: {
        template: true,
        content: true
      }
    });
    
    // Invalidate caches
    await CacheInvalidation.invalidatePage(page.siteId, pageId, page.slug);

    return NextResponse.json(section);
    
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}