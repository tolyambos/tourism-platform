import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../sites/route';
import { NextRequest } from 'next/server';
import { prisma } from '@tourism/database';

// Mock Prisma
vi.mock('@tourism/database', () => ({
  prisma: {
    site: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn()
    },
    page: {
      create: vi.fn()
    },
    template: {
      findMany: vi.fn()
    },
    section: {
      create: vi.fn(),
      createMany: vi.fn()
    },
    $executeRaw: vi.fn()
  }
}));

// Mock queues
vi.mock('@/lib/queues', () => ({
  contentGenerationQueue: {
    add: vi.fn()
  }
}));

describe('Sites API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('GET /api/sites', () => {
    it('should return paginated sites list', async () => {
      const mockSites = [
        {
          id: '1',
          name: 'Rome Tourism',
          subdomain: 'rome',
          status: 'PUBLISHED',
          createdAt: new Date(),
          _count: { pages: 5, deployments: 3 }
        },
        {
          id: '2',
          name: 'Paris Tourism',
          subdomain: 'paris',
          status: 'DRAFT',
          createdAt: new Date(),
          _count: { pages: 3, deployments: 1 }
        }
      ];
      
      vi.mocked(prisma.site.findMany).mockResolvedValue(mockSites as any);
      vi.mocked(prisma.site.count).mockResolvedValue(2);
      
      const request = new NextRequest('http://localhost:3000/api/sites?page=1&limit=10');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sites).toHaveLength(2);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      });
    });
    
    it('should filter sites by status', async () => {
      vi.mocked(prisma.site.findMany).mockResolvedValue([]);
      vi.mocked(prisma.site.count).mockResolvedValue(0);
      
      const request = new NextRequest('http://localhost:3000/api/sites?status=PUBLISHED');
      await GET(request);
      
      expect(prisma.site.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED' }
        })
      );
    });
    
    it('should search sites by name or subdomain', async () => {
      vi.mocked(prisma.site.findMany).mockResolvedValue([]);
      vi.mocked(prisma.site.count).mockResolvedValue(0);
      
      const request = new NextRequest('http://localhost:3000/api/sites?search=rome');
      await GET(request);
      
      expect(prisma.site.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'rome', mode: 'insensitive' } },
              { subdomain: { contains: 'rome', mode: 'insensitive' } }
            ]
          }
        })
      );
    });
    
    it('should return 401 if user is not authenticated', async () => {
      vi.mock('@clerk/nextjs/server', () => ({
        currentUser: vi.fn(() => Promise.resolve(null))
      }));
      
      const request = new NextRequest('http://localhost:3000/api/sites');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /api/sites', () => {
    it('should create a new site with default settings', async () => {
      const mockSite = {
        id: 'new-site-id',
        name: 'Barcelona Tourism',
        subdomain: 'barcelona',
        type: 'CITY',
        languages: ['en', 'es'],
        defaultLanguage: 'en',
        pages: [{ id: 'page-id', type: 'HOME' }]
      };
      
      vi.mocked(prisma.site.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.site.create).mockResolvedValue(mockSite as any);
      
      const request = new NextRequest('http://localhost:3000/api/sites', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Barcelona Tourism',
          subdomain: 'barcelona',
          type: 'CITY',
          languages: ['en', 'es'],
          defaultLanguage: 'en',
          locationContext: 'Barcelona, Spain - Mediterranean coastal city'
        })
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.site.name).toBe('Barcelona Tourism');
      expect(data.message).toContain('Content generation has been queued');
    });
    
    it('should return 400 if subdomain already exists', async () => {
      vi.mocked(prisma.site.findUnique).mockResolvedValue({ id: 'existing' } as any);
      
      const request = new NextRequest('http://localhost:3000/api/sites', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Site',
          subdomain: 'existing',
          type: 'CITY'
        })
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Subdomain already exists');
    });
  });
});