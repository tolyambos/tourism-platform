import { prisma } from '@tourism/database';
import { contentGenerationQueue } from '../apps/cms/src/lib/queues/content-generation.queue';

async function checkSites() {
  console.log('Checking sites in database...\n');
  
  // Get all sites
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      pages: {
        include: {
          sections: {
            include: {
              content: true
            }
          }
        }
      }
    }
  });
  
  console.log(`Found ${sites.length} sites:\n`);
  
  for (const site of sites) {
    const totalSections = site.pages.reduce((acc, page) => acc + page.sections.length, 0);
    const sectionsWithContent = site.pages.reduce((acc, page) => {
      return acc + page.sections.filter(s => s.content && s.content.length > 0).length;
    }, 0);
    
    console.log(`Site: ${site.name}`);
    console.log(`  Subdomain: ${site.subdomain}`);
    console.log(`  Status: ${site.status}`);
    console.log(`  Languages: ${site.languages.join(', ')}`);
    console.log(`  Pages: ${site.pages.length}`);
    console.log(`  Total Sections: ${totalSections}`);
    console.log(`  Sections with Content: ${sectionsWithContent}`);
    console.log(`  Content Coverage: ${totalSections > 0 ? Math.round((sectionsWithContent / totalSections) * 100) : 0}%`);
    console.log(`  URL: http://localhost:3001/en?subdomain=${site.subdomain}`);
    
    // Check if content generation is needed
    if (sectionsWithContent < totalSections) {
      console.log(`  ⚠️  Missing content for ${totalSections - sectionsWithContent} sections`);
      
      // Ask if we should generate content
      if (process.argv.includes('--generate')) {
        console.log('  🔄 Adding to content generation queue...');
        await contentGenerationQueue.add('generate-site-content', {
          siteId: site.id,
          regenerate: false
        });
      }
    }
    
    console.log('');
  }
  
  if (process.argv.includes('--generate')) {
    console.log('✅ Content generation jobs queued. Check the worker logs for progress.');
  } else {
    console.log('Tip: Run with --generate flag to queue content generation for sites missing content');
  }
}

checkSites()
  .catch(console.error)
  .finally(() => prisma.$disconnect());