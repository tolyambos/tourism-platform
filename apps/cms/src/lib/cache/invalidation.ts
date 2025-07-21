import { revalidateTag } from 'next/cache';
import { cache, CacheManager } from '../cache';

export class CacheInvalidation {
  // Invalidate site-related caches
  static async invalidateSite(siteId: string, subdomain: string) {
    // Invalidate Redis caches
    await cache.delete(CacheManager.keys.site(siteId));
    await cache.delete(CacheManager.keys.siteBySubdomain(subdomain));
    await cache.deletePattern(`site:${siteId}:*`);
    
    // Invalidate Next.js cache tags for website
    try {
      await revalidateTag(`site-${subdomain}`);
      await revalidateTag(`site-${siteId}`);
    } catch (error) {
      console.error('Error revalidating site cache tags:', error);
    }
  }
  
  // Invalidate page-related caches
  static async invalidatePage(siteId: string, pageId: string, slug: string) {
    // Invalidate Redis caches
    await cache.delete(CacheManager.keys.sitePages(siteId));
    await cache.deletePattern(`page:${pageId}:*`);
    
    // Invalidate Next.js cache tags for website
    try {
      await revalidateTag(`site-${siteId}`);
      await revalidateTag(`page-${siteId}-${slug}`);
    } catch (error) {
      console.error('Error revalidating page cache tags:', error);
    }
  }
  
  // Invalidate section content caches
  static async invalidateSectionContent(sectionId: string, siteId: string) {
    // Invalidate Redis caches
    await cache.deletePattern(`section:${sectionId}:*`);
    
    // Invalidate site cache to force refresh
    await revalidateTag(`site-${siteId}`);
  }
  
  // Invalidate user-related caches
  static async invalidateUserSites(userId: string) {
    await cache.delete(CacheManager.keys.userSites(userId));
  }
  
  // Invalidate deployment caches
  static async invalidateDeployment(siteId: string) {
    await cache.delete(CacheManager.keys.deploymentStatus(siteId));
  }
}