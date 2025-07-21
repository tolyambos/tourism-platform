import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSiteConfig } from '@/lib/api/site';

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const siteDomain = headersList.get('x-site-domain') || '';
  const siteSubdomain = headersList.get('x-site-subdomain') || '';
  
  const searchParams = request.nextUrl.searchParams;
  const subdomainParam = searchParams.get('subdomain');
  
  // Try to load site configuration
  const lookupValue = siteSubdomain || siteDomain || subdomainParam || '';
  const siteConfig = await getSiteConfig(lookupValue);
  
  return NextResponse.json({
    headers: {
      'x-site-domain': siteDomain,
      'x-site-subdomain': siteSubdomain,
    },
    params: {
      subdomain: subdomainParam
    },
    lookupValue,
    siteFound: !!siteConfig,
    site: siteConfig ? {
      id: siteConfig.id,
      name: siteConfig.name,
      subdomain: siteConfig.subdomain,
      status: siteConfig.status,
      pagesCount: siteConfig.pages.length,
      firstPageSections: siteConfig.pages[0]?.sections.slice(0, 3).map(s => ({
        id: s.id,
        templateId: s.templateId,
        template: s.template,
        contentCount: s.content.length
      }))
    } : null
  });
}