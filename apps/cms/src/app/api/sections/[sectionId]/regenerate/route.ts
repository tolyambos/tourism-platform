import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';
import { SectionContentGenerator } from '@tourism/ai-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { sectionId } = await params;
  const { siteId } = await request.json();
  
  try {
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

    // Generate new content
    const generator = new SectionContentGenerator({
      apiKey: process.env.GEMINI_API_KEY!
    });

    const content = await generator.generateContent({
      siteId: siteId,
      template: section.template,
      siteType: section.page.site.type,
      language: section.page.site.defaultLanguage
    });

    // Update or create content
    const existingContent = await prisma.sectionContent.findFirst({
      where: {
        sectionId,
        language: section.page.site.defaultLanguage
      }
    });

    if (existingContent) {
      await prisma.sectionContent.update({
        where: { id: existingContent.id },
        data: { data: content }
      });
    } else {
      await prisma.sectionContent.create({
        data: {
          sectionId,
          language: section.page.site.defaultLanguage,
          data: content
        }
      });
    }

    return NextResponse.json({ success: true, content });
    
  } catch (error) {
    console.error('Error regenerating section content:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate content' },
      { status: 500 }
    );
  }
}