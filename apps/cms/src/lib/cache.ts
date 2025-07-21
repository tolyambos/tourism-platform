import { redis } from './queues/config';

export class CacheManager {
  private static instance: CacheManager;
  private defaultTTL = 3600; // 1 hour
  
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl || this.defaultTTL) {
        await redis.setex(key, ttl || this.defaultTTL, serialized);
      } else {
        await redis.set(key, serialized);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }
  
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }
  
  // Cache key generators
  static keys = {
    site: (siteId: string) => `site:${siteId}`,
    siteBySubdomain: (subdomain: string) => `site:subdomain:${subdomain}`,
    sitePages: (siteId: string) => `site:${siteId}:pages`,
    pageContent: (pageId: string, language: string) => `page:${pageId}:content:${language}`,
    sectionContent: (sectionId: string, language: string) => `section:${sectionId}:content:${language}`,
    deploymentStatus: (siteId: string) => `deployment:${siteId}:status`,
    userSites: (userId: string) => `user:${userId}:sites`,
  };
}

// Export singleton instance
export const cache = CacheManager.getInstance();