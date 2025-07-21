import { prisma } from '@tourism/database';
import { Prisma } from '@tourism/database';

// Optimized query for fetching site configuration
export async function getOptimizedSiteConfig(domainOrSubdomain: string) {
  return prisma.site.findFirst({
    where: {
      OR: [
        { domain: domainOrSubdomain },
        { subdomain: domainOrSubdomain }
      ],
      status: 'PUBLISHED'
    },
    select: {
      id: true,
      name: true,
      domain: true,
      subdomain: true,
      type: true,
      status: true,
      languages: true,
      defaultLanguage: true,
      theme: true,
      features: true,
      seoSettings: true
    }
  });
}

// Optimized query for fetching page with content
export async function getOptimizedPageContent(
  siteId: string,
  slug: string,
  language: string
) {
  const normalizedSlug = slug === '' ? '/' : `/${slug}`;
  
  return prisma.page.findFirst({
    where: {
      siteId,
      slug: normalizedSlug,
      status: 'PUBLISHED'
    },
    select: {
      id: true,
      type: true,
      slug: true,
      sections: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          order: true,
          content: {
            where: { language },
            select: {
              id: true,
              language: true,
              data: true,
              imageUrls: true
            },
            take: 1 // Only get one content item per language
          },
          template: {
            select: {
              componentName: true
            }
          }
        }
      }
    }
  });
}

// Batch load all page slugs for a site (for sitemap generation)
export async function getSitePageSlugs(siteId: string) {
  return prisma.page.findMany({
    where: {
      siteId,
      status: 'PUBLISHED'
    },
    select: {
      slug: true,
      updatedAt: true
    }
  });
}

// Get minimal site data for header/footer
export async function getMinimalSiteData(siteId: string) {
  return prisma.site.findUnique({
    where: { id: siteId },
    select: {
      name: true,
      languages: true,
      defaultLanguage: true,
      theme: true,
      features: true
    }
  });
}