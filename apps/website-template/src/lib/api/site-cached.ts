import { unstable_cache } from 'next/cache';
import { SiteConfig } from './site';
import { 
  getOptimizedSiteConfig, 
  getOptimizedPageContent 
} from '../db/optimized-queries';

// Cache site configuration for 5 minutes
export const getCachedSiteConfig = unstable_cache(
  async (domainOrSubdomain: string): Promise<SiteConfig | null> => {
    try {
      const site = await getOptimizedSiteConfig(domainOrSubdomain);
      return site as SiteConfig;
    } catch (error) {
      console.error('Error fetching site config:', error);
      return null;
    }
  },
  ['site-config'],
  {
    revalidate: 300, // 5 minutes
    tags: [`site-config`]
  }
);

// Cache page data for 5 minutes
export const getCachedPageBySlug = unstable_cache(
  async (siteId: string, slug: string, locale: string): Promise<any | null> => {
    try {
      const page = await getOptimizedPageContent(siteId, slug, locale);
      return page;
    } catch (error) {
      console.error('Error fetching page:', error);
      return null;
    }
  },
  ['page-content'],
  {
    revalidate: 300, // 5 minutes
    tags: [`page-content`]
  }
);