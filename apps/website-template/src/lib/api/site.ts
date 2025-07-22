import { prisma } from '@tourism/database';

export interface SiteConfig {
  id: string;
  name: string;
  domain: string | null;
  subdomain: string;
  type: 'CITY' | 'ATTRACTION';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  languages: string[];
  defaultLanguage: string;
  theme: any;
  features: any;
  seoSettings: any;
  createdAt: Date;
  updatedAt: Date;
  pages: Array<{
    id: string;
    siteId: string;
    type: 'HOME' | 'CATEGORY' | 'ATTRACTION' | 'GUIDE';
    slug: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    updatedAt?: Date;
    sections: Array<{
      id: string;
      pageId: string;
      templateId: string;
      order: number;
      content: Array<{
        id: string;
        sectionId: string;
        language: string;
        data: any;
        imageUrls: string[];
        generatedBy: string;
        generatedAt: Date;
      }>;
      template: {
        componentName: string;
      };
    }>;
  }>;
}

// Cache the site config for the duration of the request
export const getSiteConfig = async (domainOrSubdomain: string): Promise<SiteConfig | null> => {
  try {
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { domain: domainOrSubdomain },
          { subdomain: domainOrSubdomain }
        ],
        status: 'PUBLISHED'
      },
      include: {
        pages: {
          where: { status: 'PUBLISHED' },
          include: {
            sections: {
              orderBy: { order: 'asc' },
              include: {
                content: true,
                template: {
                  select: { componentName: true }
                }
              }
            }
          }
        }
      }
    });
    
    return site as SiteConfig;
  } catch (error) {
    console.error('Error fetching site config:', error);
    return null;
  }
};

export const getPageBySlug = async (
  siteId: string, 
  slug: string, 
  locale: string
): Promise<any | null> => {
  try {
    const page = await prisma.page.findFirst({
      where: {
        siteId,
        slug: slug === '' ? '/' : `/${slug}`,
        status: 'PUBLISHED'
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            content: {
              where: { language: locale }
            },
            template: true
          }
        }
      }
    });
    
    return page;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
};