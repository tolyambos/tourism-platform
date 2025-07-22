import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@tourism/database';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subdomain = searchParams.get('subdomain');
  
  if (!subdomain) {
    return NextResponse.json({ error: 'Subdomain required' }, { status: 400 });
  }
  
  try {
    // First get the site
    const site = await prisma.site.findFirst({
      where: { subdomain },
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
    
    // Check content for each section
    const contentSummary = homePage.sections.map(section => ({
      sectionId: section.id,
      templateName: section.template.name,
      componentName: section.template.componentName,
      contentCount: section.content.length,
      contentLanguages: section.content.map(c => c.language),
      contentData: section.content.map(c => ({
        language: c.language,
        hasData: !!c.data,
        dataKeys: c.data ? Object.keys(c.data) : [],
        generatedBy: c.generatedBy,
        generatedAt: c.generatedAt
      }))
    }));
    
    return NextResponse.json({
      siteId: site.id,
      siteName: site.name,
      subdomain: site.subdomain,
      status: site.status,
      languages: site.languages,
      sectionsCount: homePage.sections.length,
      contentSummary
    });
  } catch (error) {
    console.error('Error checking content:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}