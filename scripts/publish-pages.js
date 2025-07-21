const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function publishPages() {
  try {
    const siteId = 'cmd9b8sym0000nje70qmf6ct1'; // Rome site ID
    
    // Update all pages to published
    const result = await prisma.page.updateMany({
      where: { siteId },
      data: { status: 'PUBLISHED' }
    });
    
    console.log(`Published ${result.count} pages for site ${siteId}`);
    
    // Also check if sections have content
    const pages = await prisma.page.findMany({
      where: { siteId },
      include: {
        sections: {
          include: {
            content: true
          }
        }
      }
    });
    
    console.log('\nSite pages:');
    pages.forEach(page => {
      console.log(`- ${page.type} page (${page.status})`);
      page.sections.forEach(section => {
        console.log(`  - Section: ${section.id} (${section.content.length} content items)`);
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

publishPages();