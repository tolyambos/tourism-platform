import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';
import { SectionContentGenerator } from '@tourism/ai-engine';

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
            sections: true
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
    
    // IMPORTANT: We only generate content for EXISTING sections
    // We do NOT create new sections here - that should be done during site creation
    // or through a separate section management endpoint
    
    // Get all sections with templates
    const sections = await prisma.section.findMany({
      where: { pageId: homePage.id },
      include: { template: true },
      orderBy: { order: 'asc' }
    });
    
    // Generate content for each section
    const generator = new SectionContentGenerator({
      apiKey: process.env.GEMINI_API_KEY!
    });
    
    const locationContext = (site.features as any)?.locationContext || site.name;
    
    for (const section of sections) {
      const result = await generator.generateSectionContent({
        section: section as any,
        template: section.template,
        context: {
          siteName: site.name,
          siteType: site.type.toLowerCase(),
          locationContext,
          language: site.defaultLanguage
        },
        languages: site.languages
      });
      
      // Save the generated content to database
      for (const { language, content } of result.contents) {
        if (content.success && content.data) {
          // Check if content already exists
          const existingContent = await prisma.sectionContent.findFirst({
            where: {
              sectionId: section.id,
              language
            }
          });
          
          if (existingContent) {
            // Update existing content
            await prisma.sectionContent.update({
              where: { id: existingContent.id },
              data: {
                data: content.data,
                generatedBy: 'gemini',
                generatedAt: new Date()
              }
            });
          } else {
            // Create new content
            await prisma.sectionContent.create({
              data: {
                sectionId: section.id,
                language,
                data: content.data,
                generatedBy: 'gemini',
                generatedAt: new Date()
              }
            });
          }
        }
      }
    }
    
    // Update site status
    await prisma.site.update({
      where: { id: siteId },
      data: { status: 'PUBLISHED' }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Content generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}