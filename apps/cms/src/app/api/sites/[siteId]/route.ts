import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma, Prisma } from '@tourism/database';
import { z } from 'zod';
import { cache, CacheManager } from '@/lib/cache';
import { QueryOptimizer } from '@/lib/db/query-optimizer';

interface RouteParams {
  params: Promise<{ siteId: string }>;
}

const updateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  domain: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  languages: z.array(z.string()).optional(),
  defaultLanguage: z.string().optional(),
  theme: z.record(z.unknown()).optional(),
  seoSettings: z.record(z.unknown()).optional(),
  features: z.record(z.unknown()).optional()
});

// GET /api/sites/[siteId] - Get a single site
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { siteId } = await params;
  
  try {
    // Try to get from cache first
    const cacheKey = CacheManager.keys.site(siteId);
    const cachedSite = await cache.get(cacheKey);
    
    if (cachedSite) {
      return NextResponse.json({ site: cachedSite });
    }
    
    // Use optimized query
    const site = await prisma.site.findUnique(QueryOptimizer.getSiteWithStats(siteId));
    
    if (site) {
      // Load related data separately to avoid over-fetching
      const [pages, deployments] = await Promise.all([
        prisma.page.findMany({
          where: { siteId },
          select: {
            id: true,
            type: true,
            slug: true,
            status: true,
            _count: {
              select: { sections: true }
            }
          }
        }),
        prisma.deployment.findMany(QueryOptimizer.getRecentDeployments(siteId))
      ]);
      
      // Combine the data
      const siteWithRelations = site as typeof site & { pages: typeof pages; deployments: typeof deployments };
      siteWithRelations.pages = pages;
      siteWithRelations.deployments = deployments;
    }
    
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    
    // Cache the site data
    await cache.set(cacheKey, site, 300); // 5 minutes TTL
    
    return NextResponse.json({ site });
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
}

// PATCH /api/sites/[siteId] - Update a site
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { siteId } = await params;
  
  try {
    const body = await request.json();
    const validatedData = updateSiteSchema.parse(body);
    
    // Check if site exists
    const existing = await prisma.site.findUnique({
      where: { id: siteId }
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    
    // Update site
    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: validatedData as Prisma.SiteUpdateInput
    });
    
    // Invalidate caches
    await cache.delete(CacheManager.keys.site(siteId));
    await cache.delete(CacheManager.keys.siteBySubdomain(existing.subdomain));
    await cache.delete(CacheManager.keys.userSites(user.id));
    
    return NextResponse.json({ site: updatedSite });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: 'Failed to update site' },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[siteId] - Delete a site
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { siteId } = await params;
  
  try {
    // Check if site exists
    const existing = await prisma.site.findUnique({
      where: { id: siteId }
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    
    // Delete site (cascades to pages, sections, content)
    await prisma.site.delete({
      where: { id: siteId }
    });
    
    // Invalidate all related caches
    await cache.delete(CacheManager.keys.site(siteId));
    await cache.delete(CacheManager.keys.siteBySubdomain(existing.subdomain));
    await cache.delete(CacheManager.keys.userSites(user.id));
    await cache.deletePattern(`site:${siteId}:*`);
    await cache.deletePattern(`deployment:${siteId}:*`);
    
    // TODO: Trigger cleanup of deployed resources
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    );
  }
}