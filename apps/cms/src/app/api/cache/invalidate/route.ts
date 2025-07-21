import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { CacheInvalidation } from '@/lib/cache/invalidation';
import { cache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { type, id, additional } = await request.json();
    
    switch (type) {
      case 'site':
        await CacheInvalidation.invalidateSite(id, additional.subdomain);
        break;
        
      case 'page':
        await CacheInvalidation.invalidatePage(
          additional.siteId,
          id,
          additional.slug
        );
        break;
        
      case 'section':
        await CacheInvalidation.invalidateSectionContent(id, additional.siteId);
        break;
        
      case 'user-sites':
        await CacheInvalidation.invalidateUserSites(user.id);
        break;
        
      case 'deployment':
        await CacheInvalidation.invalidateDeployment(id);
        break;
        
      case 'pattern':
        await cache.deletePattern(id);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid cache type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}