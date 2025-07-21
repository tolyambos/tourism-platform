import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@tourism/database';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const subdomain = url.searchParams.get('subdomain');
  
  try {
    // Get all sites
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        domain: true,
        status: true,
        type: true,
        createdAt: true,
        pages: {
          select: {
            id: true,
            type: true,
            status: true,
            _count: {
              select: {
                sections: true
              }
            }
          }
        }
      }
    });
    
    // If subdomain provided, try to find specific site
    let specificSite = null;
    if (subdomain) {
      specificSite = await prisma.site.findFirst({
        where: {
          OR: [
            { domain: subdomain },
            { subdomain: subdomain }
          ]
        },
        include: {
          pages: {
            include: {
              sections: {
                include: {
                  content: true,
                  template: true
                }
              }
            }
          }
        }
      });
    }
    
    return NextResponse.json({
      headers: {
        host: request.headers.get('host'),
        'x-site-domain': request.headers.get('x-site-domain'),
        'x-site-subdomain': request.headers.get('x-site-subdomain'),
      },
      query: {
        subdomain
      },
      sites,
      specificSite,
      totalSites: sites.length
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}