import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';
import { CacheInvalidation } from '@/lib/cache/invalidation';
import { cache, CacheManager } from '@/lib/cache';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { sectionId } = await params;
  const { content, language = 'en' } = await request.json();
  
  try {
    // Get section info for cache invalidation
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        page: {
          select: { siteId: true, slug: true }
        }
      }
    });
    
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }
    
    // Check if content already exists
    const existingContent = await prisma.sectionContent.findFirst({
      where: {
        sectionId,
        language
      }
    });

    if (existingContent) {
      // Update existing content
      await prisma.sectionContent.update({
        where: { id: existingContent.id },
        data: { data: content }
      });
    } else {
      // Create new content
      await prisma.sectionContent.create({
        data: {
          sectionId,
          language,
          data: content
        }
      });
    }
    
    // Invalidate caches
    await CacheInvalidation.invalidateSectionContent(sectionId, section.page.siteId);
    await cache.delete(CacheManager.keys.sectionContent(sectionId, language));

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating section content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}