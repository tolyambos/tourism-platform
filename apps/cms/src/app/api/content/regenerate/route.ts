import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';
import { SectionContentGenerator } from '@tourism/ai-engine';

export async function POST(request: NextRequest) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { sectionId, language, regenerateImages = false } = body;
    
    if (!sectionId || !language) {
      return NextResponse.json(
        { error: 'sectionId and language are required' },
        { status: 400 }
      );
    }
    
    // Get section with template and site info
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        template: true,
        page: {
          include: {
            site: true
          }
        }
      }
    });
    
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }
    
    const site = section.page.site;
    const locationContext = (site.features as any)?.locationContext || site.name;
    
    // Initialize content generator
    const generator = new SectionContentGenerator({
      apiKey: process.env.GEMINI_API_KEY!
    });
    
    // Generate new content
    const result = await generator.generateSectionContent({
      section: section as any,
      template: section.template,
      context: {
        siteName: site.name,
        siteType: site.type.toLowerCase(),
        locationContext,
        language
      },
      languages: [language]
    });
    
    if (!result.contents[0]?.content.success) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }
    
    const generatedContent = result.contents[0].content.data;
    
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
        data: {
          data: generatedContent,
          generatedBy: 'gemini',
          generatedAt: new Date(),
          version: existingContent.version + 1
        }
      });
    } else {
      // Create new content
      await prisma.sectionContent.create({
        data: {
          sectionId,
          language,
          data: generatedContent,
          generatedBy: 'gemini',
          generatedAt: new Date()
        }
      });
    }
    
    // TODO: If regenerateImages is true, trigger image regeneration
    
    return NextResponse.json({
      success: true,
      content: generatedContent
    });
    
  } catch (error) {
    console.error('Error regenerating content:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate content' },
      { status: 500 }
    );
  }
}