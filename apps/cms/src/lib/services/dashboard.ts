import { prisma } from '@tourism/database';
import { cache } from 'react';

export const getDashboardStats = cache(async () => {
  const [totalSites, publishedSites, totalViews] = await Promise.all([
    prisma.site.count(),
    prisma.site.count({ where: { status: 'PUBLISHED' } }),
    // For now, return 0 for views - this would come from analytics
    Promise.resolve(0),
  ]);
  
  return {
    totalSites,
    publishedSites,
    totalViews,
  };
});

export const getRecentSites = cache(async (limit = 5) => {
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      subdomain: true,
      status: true,
      type: true,
      createdAt: true,
    },
  });
  
  return sites;
});

export const getSiteGrowth = cache(async () => {
  // Calculate growth percentage (mock data for now)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [currentCount, previousCount] = await Promise.all([
    prisma.site.count(),
    prisma.site.count({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    }),
  ]);
  
  const growth = previousCount === 0 
    ? 100 
    : ((currentCount - previousCount) / previousCount) * 100;
  
  return {
    currentCount,
    previousCount,
    growth: Math.round(growth),
    isPositive: growth >= 0,
  };
});