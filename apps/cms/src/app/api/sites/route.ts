import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma, Prisma } from '@tourism/database';
import { z } from 'zod';
import { cache, CacheManager } from '@/lib/cache';
import { QueryOptimizer } from '@/lib/db/query-optimizer';

const createSiteSchema = z.object({
  name: z.string().min(1).max(100),
  subdomain: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  type: z.enum(['CITY', 'ATTRACTION']),
  languages: z.array(z.string()).min(1),
  defaultLanguage: z.string(),
  locationContext: z.string().optional(),
  theme: z.record(z.unknown()).optional()
});

export async function GET(request: NextRequest) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  
  try {
    // Try to get from cache if no filters
    if (!status && !search && page === 1) {
      const cacheKey = CacheManager.keys.userSites(user.id);
      const cachedSites = await cache.get(cacheKey);
      
      if (cachedSites) {
        return NextResponse.json(cachedSites);
      }
    }
    
    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subdomain: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Use optimized queries
    const [sites, total] = await Promise.all([
      prisma.site.findMany(QueryOptimizer.getSitesForListing(user.id, {
        page,
        limit,
        status: status ?? undefined,
        search: search ?? undefined
      })),
      prisma.site.count({ where })
    ]);
    
    const response = {
      sites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    // Cache only the first page with no filters
    if (!status && !search && page === 1) {
      await cache.set(CacheManager.keys.userSites(user.id), response, 300); // 5 minutes
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const validatedData = createSiteSchema.parse(body);
    
    // Check if subdomain already exists
    const existing = await prisma.site.findUnique({
      where: { subdomain: validatedData.subdomain }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Subdomain already exists' },
        { status: 400 }
      );
    }
    
    // Create site with pages and default sections
    const { ...siteData } = validatedData;
    const site = await prisma.site.create({
      data: {
        ...siteData,
        status: 'DRAFT',
        seoSettings: {
          description: `Discover ${validatedData.name} - Your guide to amazing experiences`,
          keywords: [validatedData.name.toLowerCase(), 'tourism', 'travel', 'guide'],
        },
        theme: validatedData.theme || {
          colors: {
            primary: '#3B82F6',
            secondary: '#10B981',
            accent: '#F59E0B',
          }
        },
        features: {
          enableBooking: true,
          enableReviews: true,
          enableGallery: true,
          locationContext: validatedData.locationContext
        },
        pages: {
          create: {
            type: 'HOME',
            slug: '/',
            status: 'DRAFT'
          }
        }
      } as Prisma.SiteCreateInput,
      include: {
        pages: true
      }
    });
    
    // Create default sections for the home page
    const homePage = site.pages[0];
    
    // Get default templates based on site type from config
    const { getTemplateNamesForSiteType } = await import('@/config/site-sections.config');
    const defaultTemplateNames = getTemplateNamesForSiteType(validatedData.type);
    
    const templates = await prisma.template.findMany({
      where: {
        name: { in: defaultTemplateNames },
        isActive: true
      }
    });
    
    // Sort templates according to the default order
    const sortedTemplates = defaultTemplateNames
      .map(name => templates.find(t => t.name === name))
      .filter(Boolean);
    
    if (sortedTemplates.length > 0) {
      await prisma.section.createMany({
        data: sortedTemplates.map((template, index) => ({
          pageId: homePage.id,
          templateId: template!.id,
          order: index
        }))
      });
    }
    
    // Queue content generation if Redis is available
    try {
      const { getContentGenerationQueue } = await import('@/lib/queues/content-generation.queue');
      const queue = getContentGenerationQueue();
      if (queue) {
        await queue.add('generate-initial-content', {
          siteId: site.id,
          pageId: homePage.id
        });
      } else {
        console.log('Redis not available, skipping content generation queue');
      }
    } catch (error) {
      console.log('Could not queue content generation:', error);
      // Continue without queuing - user can manually generate content later
    }
    
    // Invalidate user sites cache
    await cache.delete(CacheManager.keys.userSites(user.id));
    
    return NextResponse.json({ 
      site,
      message: 'Site created successfully. Content generation has been queued.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating site:', error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}