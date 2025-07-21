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
    // Get the site
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        pages: {
          where: { type: 'HOME' },
          include: {
            sections: {
              include: {
                content: true
              }
            }
          }
        }
      }
    });
    
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    
    const homePage = site.pages[0];
    if (!homePage) {
      return NextResponse.json({ error: 'Home page not found' }, { status: 404 });
    }
    
    // Delete existing sections (this will cascade delete content)
    await prisma.section.deleteMany({
      where: { pageId: homePage.id }
    });
    
    // Get new templates based on site type
    const defaultTemplateNames = site.type === 'CITY' 
      ? ['hero', 'attractions-grid', 'features', 'testimonials', 'cta']
      : ['attraction-hero', 'quick-info-bar', 'product-cards', 'tabbed-info', 'reviews-carousel', 'faq-accordion', 'final-cta'];
    
    const templates = await prisma.template.findMany({
      where: {
        name: { in: defaultTemplateNames },
        isActive: true
      }
    });
    
    // Sort templates according to the default order
    const sortedTemplates = defaultTemplateNames
      .map(name => templates.find(t => t.name === name))
      .filter(Boolean);
    
    if (sortedTemplates.length === 0) {
      return NextResponse.json({ 
        error: 'No templates found. Make sure you have run the database seed.' 
      }, { status: 400 });
    }
    
    // Create new sections
    const newSections = await prisma.section.createMany({
      data: sortedTemplates.map((template, index) => ({
        pageId: homePage.id,
        templateId: template!.id,
        order: index
      }))
    });
    
    
    // Queue content generation for the new sections
    const { contentGenerationQueue } = await import('@/lib/queues');
    await contentGenerationQueue.add('generate-content', {
      siteId: site.id,
      pageId: homePage.id,
      regenerate: true
    });
    
    // Clear any cached data for this site
    const { cache, CacheManager } = await import('@/lib/cache');
    await cache.delete(CacheManager.keys.site(siteId));
    await cache.delete(CacheManager.keys.sitePages(siteId));
    
    return NextResponse.json({ 
      success: true,
      message: 'Site rebuild initiated successfully. Content generation has been queued.',
      sectionsCreated: newSections.count,
      templates: defaultTemplateNames
    });
    
  } catch (error) {
    console.error('Site rebuild error:', error);
    return NextResponse.json(
      { error: 'Failed to rebuild site', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}