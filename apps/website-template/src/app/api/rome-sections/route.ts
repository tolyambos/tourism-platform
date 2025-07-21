import { NextResponse } from 'next/server';
import { prisma } from '@tourism/database';

export async function GET() {
  const site = await prisma.site.findFirst({
    where: {
      subdomain: 'rome',
      status: 'PUBLISHED'
    },
    include: {
      pages: {
        where: { 
          type: 'HOME',
          status: 'PUBLISHED' 
        },
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: {
              content: {
                where: { language: 'en' }
              },
              template: true
            }
          }
        }
      }
    }
  });
  
  if (!site || !site.pages[0]) {
    return NextResponse.json({ error: 'Site or home page not found' });
  }
  
  const sections = site.pages[0].sections.map(section => ({
    id: section.id,
    templateId: section.templateId,
    hasTemplate: !!section.template,
    templateData: section.template,
    contentAvailable: section.content.length > 0,
    contentPreview: section.content[0]?.data ? 
      JSON.stringify(section.content[0].data).substring(0, 100) + '...' : 
      null
  }));
  
  return NextResponse.json({
    siteName: site.name,
    sectionsCount: sections.length,
    sections
  });
}