import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getCachedSiteConfig, getCachedPageBySlug } from '@/lib/api/site-cached';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SectionRenderer } from '@/components/section-renderer';

export default async function HomePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  
  // Get site info from headers
  const headersList = await headers();
  const siteDomain = headersList.get('x-site-domain') || '';
  const siteSubdomain = headersList.get('x-site-subdomain') || '';
  
  // Also check for subdomain in query params (for local development)
  const subdomainParam = search.subdomain as string | undefined;
  
  // Load site configuration with caching
  const lookupValue = siteSubdomain || siteDomain || subdomainParam || '';
  const siteConfig = await getCachedSiteConfig(lookupValue);
  
  if (!siteConfig) {
    notFound();
  }
  
  // Check if the locale is supported by this site
  if (!siteConfig.languages.includes(locale)) {
    notFound();
  }
  
  // Load home page content with caching
  const page = await getCachedPageBySlug(siteConfig.id, '', locale);
  
  if (!page) {
    notFound();
  }
  
  // Use sections directly from the page data
  const sections = page.sections;
  
  return (
    <ThemeProvider theme={siteConfig.theme}>
      <div className="min-h-screen flex flex-col">
        <Header siteConfig={siteConfig} locale={locale} />
        <main className="flex-grow">
          <div className="flex flex-col">
            {sections.map((section: any) => {
              console.log('Rendering section:', {
                id: section.id,
                templateName: section.template?.name,
                componentName: section.template?.componentName,
                hasContent: !!section.content,
                contentLength: section.content?.length
              });
              return (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  locale={locale}
                />
              );
            })}
          </div>
        </main>
        <Footer siteConfig={siteConfig} locale={locale} />
      </div>
    </ThemeProvider>
  );
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 300; // Revalidate every 5 minutes