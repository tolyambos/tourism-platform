import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/api/site';

export async function GET() {
  const siteConfig = await getSiteConfig('rome');
  
  if (!siteConfig) {
    return NextResponse.json({ error: 'Site not found' });
  }
  
  const homePage = siteConfig.pages.find(p => p.type === 'HOME');
  
  return NextResponse.json({
    siteFound: true,
    siteName: siteConfig.name,
    homePageFound: !!homePage,
    sectionsCount: homePage?.sections.length || 0,
    firstThreeSections: homePage?.sections.slice(0, 3).map(s => ({
      id: s.id,
      hasTemplate: !!s.template,
      templateData: s.template,
      hasContent: s.content.length > 0,
      contentLanguages: s.content.map(c => c.language)
    }))
  });
}