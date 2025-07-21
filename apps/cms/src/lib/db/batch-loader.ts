import DataLoader from 'dataloader';
import { prisma } from '@tourism/database';

// Batch loader for sites to avoid N+1 queries
export const siteLoader = new DataLoader(async (siteIds: readonly string[]) => {
  const sites = await prisma.site.findMany({
    where: { id: { in: [...siteIds] } },
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
      updatedAt: true
    }
  });
  
  const siteMap = new Map(sites.map(site => [site.id, site]));
  return siteIds.map(id => siteMap.get(id) || null);
});

// Batch loader for pages
export const pageLoader = new DataLoader(async (pageIds: readonly string[]) => {
  const pages = await prisma.page.findMany({
    where: { id: { in: [...pageIds] } },
    select: {
      id: true,
      siteId: true,
      type: true,
      slug: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  const pageMap = new Map(pages.map(page => [page.id, page]));
  return pageIds.map(id => pageMap.get(id) || null);
});

// Batch loader for section content by section ID and language
interface SectionContentKey {
  sectionId: string;
  language: string;
}

export const sectionContentLoader = new DataLoader(
  async (keys: readonly SectionContentKey[]) => {
    const sectionIds = [...new Set(keys.map(k => k.sectionId))];
    const languages = [...new Set(keys.map(k => k.language))];
    
    const contents = await prisma.sectionContent.findMany({
      where: {
        sectionId: { in: sectionIds },
        language: { in: languages }
      }
    });
    
    const contentMap = new Map(
      contents.map(content => [
        `${content.sectionId}:${content.language}`,
        content
      ])
    );
    
    return keys.map(key => 
      contentMap.get(`${key.sectionId}:${key.language}`) || null
    );
  },
  {
    cacheKeyFn: (key: SectionContentKey) => `${key.sectionId}:${key.language}`
  }
);

// Batch loader for deployments by site
export const deploymentsBySiteLoader = new DataLoader(
  async (siteIds: readonly string[]) => {
    const deployments = await prisma.deployment.findMany({
      where: { siteId: { in: [...siteIds] } },
      orderBy: { startedAt: 'desc' },
      take: 100 // Limit total results
    });
    
    const deploymentsBySite = new Map<string, typeof deployments>();
    deployments.forEach(deployment => {
      const siteDeployments = deploymentsBySite.get(deployment.siteId) || [];
      if (siteDeployments.length < 5) { // Only keep 5 most recent per site
        siteDeployments.push(deployment);
        deploymentsBySite.set(deployment.siteId, siteDeployments);
      }
    });
    
    return siteIds.map(siteId => deploymentsBySite.get(siteId) || []);
  }
);