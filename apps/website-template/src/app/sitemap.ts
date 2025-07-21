import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getSiteConfig } from '@/lib/api/site';
import { locales } from '@/i18n';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;
  
  // Get site configuration
  const siteConfig = await getSiteConfig(host);
  if (!siteConfig) {
    return [];
  }
  
  const urls: MetadataRoute.Sitemap = [];
  
  // Add home page for each language
  for (const locale of siteConfig.languages) {
    urls.push({
      url: `${baseUrl}/${locale}`,
      lastModified: siteConfig.updatedAt,
      changeFrequency: 'daily',
      priority: 1.0,
    });
  }
  
  // Add all published pages
  for (const page of siteConfig.pages) {
    for (const locale of siteConfig.languages) {
      const slug = page.slug === '/' ? '' : page.slug;
      urls.push({
        url: `${baseUrl}/${locale}${slug}`,
        lastModified: page.updatedAt || siteConfig.updatedAt,
        changeFrequency: page.type === 'HOME' ? 'daily' : 'weekly',
        priority: page.type === 'HOME' ? 1.0 : 0.8,
      });
    }
  }
  
  return urls;
}