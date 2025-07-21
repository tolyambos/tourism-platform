import { Prisma, Status } from '@tourism/database';

export class QueryOptimizer {
  // Optimize site queries with selective field loading
  static getSiteWithStats(siteId: string) {
    return {
      where: { id: siteId },
      select: {
        id: true,
        name: true,
        subdomain: true,
        domain: true,
        status: true,
        type: true,
        languages: true,
        defaultLanguage: true,
        theme: true,
        features: true,
        seoSettings: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            pages: true,
            deployments: true
          }
        }
      }
    } satisfies Prisma.SiteFindUniqueArgs;
  }
  
  // Optimize page queries by only loading necessary content
  static getPageWithContent(pageId: string, language: string) {
    return {
      where: { id: pageId },
      select: {
        id: true,
        siteId: true,
        type: true,
        slug: true,
        status: true,
        sections: {
          orderBy: { order: 'asc' as const },
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
              }
            },
            template: {
              select: {
                id: true,
                componentName: true,
                schema: true
              }
            }
          }
        }
      }
    } satisfies Prisma.PageFindUniqueArgs;
  }
  
  // Batch load sections to avoid N+1 queries
  static getSectionsWithContentBatch(sectionIds: string[], language: string) {
    return {
      where: {
        id: { in: sectionIds }
      },
      include: {
        content: {
          where: { language }
        },
        template: {
          select: {
            componentName: true,
            schema: true
          }
        }
      }
    } satisfies Prisma.SectionFindManyArgs;
  }
  
  // Optimize site listing queries
  static getSitesForListing(userId?: string, options?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, status, search } = options || {};
    
    const where: Prisma.SiteWhereInput = {};
    
    if (status) {
      where.status = status as Status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subdomain: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    return {
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' as const },
      select: {
        id: true,
        name: true,
        subdomain: true,
        domain: true,
        status: true,
        type: true,
        createdAt: true,
        _count: {
          select: {
            pages: true,
            deployments: true
          }
        }
      }
    } satisfies Prisma.SiteFindManyArgs;
  }
  
  // Use raw queries for complex aggregations
  static async getSiteAnalytics(siteId: string, prisma: typeof import('@tourism/database').prisma) {
    const result = await prisma.$queryRaw<Array<{
      total_pages: bigint;
      total_sections: bigint;
      total_content_items: bigint;
      successful_deployments: bigint;
      last_deployment: Date | null;
    }>>`
      SELECT 
        COUNT(DISTINCT p.id) as total_pages,
        COUNT(DISTINCT s.id) as total_sections,
        COUNT(DISTINCT sc.id) as total_content_items,
        COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'SUCCESS') as successful_deployments,
        MAX(d."createdAt") as last_deployment
      FROM "Site" site
      LEFT JOIN "Page" p ON p."siteId" = site.id
      LEFT JOIN "Section" s ON s."pageId" = p.id
      LEFT JOIN "SectionContent" sc ON sc."sectionId" = s.id
      LEFT JOIN "Deployment" d ON d."siteId" = site.id
      WHERE site.id = ${siteId}
    `;
    
    return result[0];
  }
  
  // Optimize deployment queries
  static getRecentDeployments(siteId: string, limit = 5) {
    return {
      where: { siteId },
      orderBy: { startedAt: 'desc' as const },
      take: limit,
      select: {
        id: true,
        status: true,
        environment: true,
        startedAt: true,
        completedAt: true,
        error: true
      }
    } satisfies Prisma.DeploymentFindManyArgs;
  }
}