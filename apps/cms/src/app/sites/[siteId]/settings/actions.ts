'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';

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

  // Update site
  await prisma.site.update({
    where: { id: siteId },
    data: {
      name,
      subdomain,
      domain: domain || null,
      status: status as any,
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