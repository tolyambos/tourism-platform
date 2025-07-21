import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';
import { getSectionsForSiteType } from '@/config/site-sections.config';

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
    // Get site details
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        pages: {
          where: { type: 'HOME' },
          include: {
            sections: {
              include: {
                template: true,
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
    
    // Get the correct sections for this site type
    const correctSections = getSectionsForSiteType(site.type as 'CITY' | 'ATTRACTION');
    const correctTemplateNames = correctSections.map(s => s.templateName);
    
    // Find sections to remove (not in the correct list)
    const sectionsToRemove = homePage.sections.filter(section => 
      !correctTemplateNames.includes(section.template.name)
    );
    
    // Delete incorrect sections and their content
    if (sectionsToRemove.length > 0) {
      // First delete content
      await prisma.sectionContent.deleteMany({
        where: {
          sectionId: { in: sectionsToRemove.map(s => s.id) }
        }
      });
      
      // Then delete sections
      await prisma.section.deleteMany({
        where: {
          id: { in: sectionsToRemove.map(s => s.id) }
        }
      });
    }
    
    // Reorder remaining sections according to config
    const remainingSections = await prisma.section.findMany({
      where: { pageId: homePage.id },
      include: { template: true },
      orderBy: { order: 'asc' }
    });
    
    // Update order based on config
    for (const section of remainingSections) {
      const configSection = correctSections.find(cs => cs.templateName === section.template.name);
      if (configSection) {
        await prisma.section.update({
          where: { id: section.id },
          data: { order: configSection.order }
        });
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Cleaned up ${sectionsToRemove.length} incorrect sections`,
      removedSections: sectionsToRemove.map(s => s.template.name)
    });
    
  } catch (error) {
    console.error('Error cleaning up sections:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup sections' },
      { status: 500 }
    );
  }
}