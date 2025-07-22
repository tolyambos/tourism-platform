import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';
import { Prisma } from '@tourism/database';

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
                content: true,
                template: true
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
    
    // Store existing content before any changes
    const existingContent = homePage.sections.flatMap(section => 
      section.content.map(content => ({
        templateName: section.template.name,
        ...content
      }))
    );
    
    // Get new templates based on site type
    const defaultTemplateNames = site.type === 'CITY' 
      ? ['hero', 'attractions-grid', 'features', 'testimonials', 'cta']
      : ['attraction-hero', 'quick-info-bar', 'product-cards', 'tabbed-info', 'reviews-carousel', 'faq-accordion', 'final-cta'];
    
    const templates = await prisma.template.findMany({
      where: {
        name: { in: defaultTemplateNames },
        isActive: true
      },
      include: {
        sections: {
          where: { pageId: homePage.id },
          include: { content: true }
        }
      }
    });
    
    // Check which templates are missing
    const existingTemplateIds = homePage.sections.map(s => s.templateId);
    const missingTemplates = templates.filter(t => !existingTemplateIds.includes(t.id));
    
    if (missingTemplates.length === 0) {
      // All templates already exist, just reorder them
      const templateOrder = defaultTemplateNames.reduce((acc, name, index) => {
        const template = templates.find(t => t.name === name);
        if (template) acc[template.id] = index;
        return acc;
      }, {} as Record<string, number>);
      
      // Update order for existing sections
      await Promise.all(
        homePage.sections.map(section => 
          prisma.section.update({
            where: { id: section.id },
            data: { order: templateOrder[section.templateId] ?? 999 }
          })
        )
      );
      
      return NextResponse.json({ 
        success: true,
        message: 'Site structure updated. All content preserved.',
        sectionsReordered: homePage.sections.length
      });
    }
    
    // Only add missing sections
    const newSections = await Promise.all(
      missingTemplates.map(async (template, index) => {
        const order = defaultTemplateNames.indexOf(template.name);
        const section = await prisma.section.create({
          data: {
            pageId: homePage.id,
            templateId: template.id,
            order: order >= 0 ? order : 999 + index
          }
        });
        
        // Check if we have content for this template from before
        const previousContent = existingContent.filter(c => c.templateName === template.name);
        if (previousContent.length > 0) {
          // Restore previous content
          await Promise.all(
            previousContent.map(content => 
              prisma.sectionContent.create({
                data: {
                  sectionId: section.id,
                  language: content.language,
                  data: content.data as Prisma.InputJsonValue,
                  imageUrls: content.imageUrls,
                  generatedBy: content.generatedBy,
                  generatedAt: content.generatedAt
                }
              })
            )
          );
        }
        
        return section;
      })
    );
    
    // Reorder all sections
    const allSections = [...homePage.sections, ...newSections];
    await Promise.all(
      allSections.map(section => {
        const template = templates.find(t => t.id === section.templateId);
        const order = template ? defaultTemplateNames.indexOf(template.name) : 999;
        return prisma.section.update({
          where: { id: section.id },
          data: { order: order >= 0 ? order : 999 }
        });
      })
    );
    
    
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
      message: `Site structure updated. ${newSections.length} new sections added. All content preserved.`,
      sectionsCreated: newSections.length,
      sectionsTotal: allSections.length,
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