'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';
import { vercelDomainService } from '@/lib/services/vercel-domains';

export async function updateSiteSettings(siteId: string, formData: FormData) {
  try {
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

    console.log('updateSiteSettings called with:', { siteId, domain });

  // Get selected languages
  const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'].filter(
    lang => formData.get(`lang-${lang}`) === 'on'
  );

  // Get current site to check if domain changed
  const currentSite = await prisma.site.findUnique({
    where: { id: siteId },
    select: { domain: true }
  });

  // Handle domain changes with Vercel
  if (currentSite) {
    const oldDomain = currentSite.domain;
    const newDomain = domain || null;

    // Domain was removed
    if (oldDomain && !newDomain) {
      await vercelDomainService.removeDomain(oldDomain);
    }
    
    // Domain was added or changed
    if (newDomain && newDomain !== oldDomain) {
      console.log('Domain change detected:', { oldDomain, newDomain });
      
      // Remove old domain if it exists
      if (oldDomain) {
        console.log('Removing old domain:', oldDomain);
        await vercelDomainService.removeDomain(oldDomain);
      }
      
      // Add new domain
      console.log('Adding new domain:', newDomain);
      const result = await vercelDomainService.addDomain(newDomain);
      console.log('Add domain result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add domain to Vercel');
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
  } catch (error) {
    console.error('Error in updateSiteSettings:', error);
    throw error;
  }
}

export async function checkDomainStatus(domain: string) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    return await vercelDomainService.getDomainStatus(domain);
  } catch (error) {
    console.error('Error checking domain status:', error);
    return {
      exists: false,
      verified: false,
      dnsConfigured: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}