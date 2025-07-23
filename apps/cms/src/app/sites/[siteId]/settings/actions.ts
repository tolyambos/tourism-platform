'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';
import { vercelDomainService } from '@/lib/services/vercel-domains';

export async function updateSiteSettings(siteId: string, formData: FormData) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('site-name') as string;
  const subdomain = formData.get('subdomain') as string;
  const domain = formData.get('custom-domain') as string;
  const status = formData.get('status') as string;
  const defaultLanguage = formData.get('default-language') as string;
  const metaTitle = formData.get('meta-title') as string;
  const metaDescription = formData.get('meta-description') as string;
  const noindex = formData.get('noindex') === 'on';

  // Get selected languages
  const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'].filter(
    lang => formData.get(`lang-${lang}`) === 'on'
  );

  // Get current site to check if domain changed
  const currentSite = await prisma.site.findUnique({
    where: { id: siteId },
    select: { domain: true }
  });

  // Handle domain changes
  if (currentSite) {
    const oldDomain = currentSite.domain;
    const newDomain = domain || null;

    // Domain was removed
    if (oldDomain && !newDomain) {
      try {
        await vercelDomainService.removeDomain(oldDomain);
      } catch (error) {
        console.error('Failed to remove domain from Vercel:', error);
      }
    }
    
    // Domain was added or changed
    if (newDomain && newDomain !== oldDomain) {
      try {
        // Remove old domain if it exists
        if (oldDomain) {
          await vercelDomainService.removeDomain(oldDomain);
        }
        
        // Add new domain
        await vercelDomainService.addDomain(newDomain);
      } catch (error) {
        console.error('Failed to add domain to Vercel:', error);
        throw new Error('Failed to configure custom domain. Please check the domain format and try again.');
      }
    }
  }

  // Update site
  await prisma.site.update({
    where: { id: siteId },
    data: {
      name,
      subdomain,
      domain: domain || null,
      status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      defaultLanguage,
      languages,
      seoSettings: {
        title: metaTitle,
        description: metaDescription,
        noindex
      }
    }
  });

  revalidatePath(`/sites/${siteId}/settings`);
  revalidatePath(`/sites/${siteId}`);
}

export async function checkDomainStatus(domain: string) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    const domainInfo = await vercelDomainService.getDomain(domain);
    const dnsInstructions = vercelDomainService.getDNSInstructions(domain);
    
    return {
      exists: !!domainInfo,
      verified: domainInfo?.verified || false,
      verification: domainInfo?.verification || [],
      dnsInstructions
    };
  } catch (error) {
    console.error('Error checking domain status:', error);
    return {
      exists: false,
      verified: false,
      verification: [],
      dnsInstructions: vercelDomainService.getDNSInstructions(domain)
    };
  }
}