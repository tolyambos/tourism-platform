import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { getSiteConfig, getPageBySlug } from '@/lib/api/site';
import { SectionRenderer } from '@/components/section-renderer';

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const search = await searchParams;
  const headersList = await headers();
  const siteDomain = headersList.get('x-site-domain') || '';
  const siteSubdomain = headersList.get('x-site-subdomain') || '';
  const subdomainParam = search.subdomain as string | undefined;
  
  const lookupValue = siteSubdomain || siteDomain || subdomainParam || '';
  const siteConfig = await getSiteConfig(lookupValue);
  if (!siteConfig) return {};
  
  const page = await getPageBySlug(siteConfig.id, slug.join('/'), locale);
  if (!page) return {};
  
  // Extract SEO data from page sections or use defaults
  const seoData = page.sections.find((s: any) => s.template.name === 'seo-meta')?.content[0]?.data as any;
  
  // Check if noindex is enabled
  const seoSettings = siteConfig.seoSettings as Record<string, any> || {};
  const noindex = seoSettings.noindex || false;
  
  return {
    title: seoData?.title || `${page.slug} - ${siteConfig.name}`,
    description: seoData?.description || seoSettings.description || '',
    ...(noindex && {
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
    }),
    openGraph: {
      title: seoData?.ogTitle || seoData?.title || `${page.slug} - ${siteConfig.name}`,
      description: seoData?.ogDescription || seoData?.description || '',
      images: seoData?.ogImage ? [seoData.ogImage] : [],
      locale: locale,
      type: 'website',
    },
    alternates: {
      languages: siteConfig.languages.reduce((acc: any, lang: string) => ({
        ...acc,
        [lang]: `/${lang}/${slug.join('/')}`
      }), {})
    }
  };
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  const search = await searchParams;
  
  // Get site info from headers
  const headersList = await headers();
  const siteDomain = headersList.get('x-site-domain') || '';
  const siteSubdomain = headersList.get('x-site-subdomain') || '';
  
  // Also check for subdomain in query params (for local development)
  const subdomainParam = search.subdomain as string | undefined;
  
  // Load site configuration
  const lookupValue = siteSubdomain || siteDomain || subdomainParam || '';
  const siteConfig = await getSiteConfig(lookupValue);
  if (!siteConfig) {
    notFound();
  }
  
  // Load page content
  const page = await getPageBySlug(siteConfig.id, slug.join('/'), locale);
  if (!page) {
    notFound();
  }
  
  return (
    <div className="flex flex-col">
      {page.sections.map((section: any) => (
        <SectionRenderer
          key={section.id}
          section={section}
          locale={locale}
        />
      ))}
    </div>
  );
}

// Enable ISR
export const revalidate = 3600; // Revalidate every hour

// Generate static paths for known pages
export async function generateStaticParams() {
  // In production, this would fetch all published pages
  // For now, return empty array to use on-demand generation
  return [];
}