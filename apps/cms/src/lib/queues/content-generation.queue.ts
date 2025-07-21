import { Queue, Worker, Job } from 'bullmq';
import { createRedisConnection } from './config';
import { prisma } from '@tourism/database';
import { SectionContentGenerator } from '@tourism/ai-engine';

interface ContentGenerationData {
  siteId: string;
  pageId?: string;
  sectionId?: string;
  language?: string;
  regenerate?: boolean;
}

// Lazy queue initialization
let _contentGenerationQueue: Queue<ContentGenerationData> | null = null;
let _contentGenerationWorker: Worker<ContentGenerationData> | null = null;

export function getContentGenerationQueue() {
  if (!_contentGenerationQueue) {
    const redis = createRedisConnection();
    if (redis) {
      _contentGenerationQueue = new Queue<ContentGenerationData>('content-generation', {
        connection: redis
      });
    }
  }
  return _contentGenerationQueue;
}

export function getContentGenerationWorker() {
  if (!_contentGenerationWorker) {
    const redis = createRedisConnection();
    if (redis) {
      _contentGenerationWorker = new Worker<ContentGenerationData>(
        'content-generation',
        async (job: Job<ContentGenerationData>) => {
          const { siteId, pageId, sectionId, language, regenerate } = job.data;
          
          console.log(`Processing content generation job ${job.id}`, job.data);
          
          try {
            const generator = new SectionContentGenerator({
              apiKey: process.env.GEMINI_API_KEY!
            });
            
            // Get site details
            const site = await prisma.site.findUnique({
              where: { id: siteId }
            });
            
            if (!site) {
              throw new Error('Site not found');
            }
            
            const locationContext = String((site.features as Record<string, unknown>)?.locationContext || site.name);
            const languages = language ? [language] : site.languages;
            
            // If specific section
            if (sectionId) {
              const section = await prisma.section.findUnique({
                where: { id: sectionId },
                include: { template: true }
              });
              
              if (!section) {
                throw new Error('Section not found');
              }
              
              await generateSectionContent(
                generator,
                section,
                site,
                locationContext,
                languages,
                regenerate
              );
              
              await job.updateProgress(100);
              return { sectionsGenerated: 1 };
            }
            
            // If specific page or all pages
            const pages = await prisma.page.findMany({
              where: {
                siteId,
                ...(pageId ? { id: pageId } : {})
              },
              include: {
                sections: {
                  include: { template: true }
                }
              }
            });
            
            let sectionsGenerated = 0;
            const totalSections = pages.reduce((acc, page) => acc + page.sections.length, 0);
            
            for (const page of pages) {
              for (const section of page.sections) {
                await generateSectionContent(
                  generator,
                  section,
                  site,
                  locationContext,
                  languages,
                  regenerate
                );
                
                sectionsGenerated++;
                await job.updateProgress((sectionsGenerated / totalSections) * 100);
              }
            }
            
            // Update site status if all content generated
            if (!pageId && !sectionId) {
              await prisma.site.update({
                where: { id: siteId },
                data: { status: 'PUBLISHED' }
              });
            }
            
            return { sectionsGenerated };
            
          } catch (error) {
            console.error('Content generation failed:', error);
            throw error;
          }
        },
        {
          connection: redis
        }
      );

      // Queue event listeners
      _contentGenerationWorker.on('completed', (job) => {
        console.log(`Content generation job ${job.id} completed`);
      });

      _contentGenerationWorker.on('failed', (job, err) => {
        console.error(`Content generation job ${job?.id} failed:`, err);
      });
    }
  }
  return _contentGenerationWorker;
}

// Helper function to generate content for a section
async function generateSectionContent(
  generator: SectionContentGenerator,
  section: { id: string; template: Record<string, unknown> },
  site: { name: string; type: string },
  locationContext: string,
  languages: string[],
  regenerate = false
) {
  // Check if content already exists
  if (!regenerate) {
    const existingContent = await prisma.sectionContent.findMany({
      where: {
        sectionId: section.id,
        language: { in: languages }
      }
    });
    
    if (existingContent.length === languages.length) {
      console.log(`Content already exists for section ${section.id}`);
      return;
    }
  }
  
  const result = await generator.generateSectionContent({
    // @ts-expect-error - Section and Template type mismatch between packages
    section,
    // @ts-expect-error - Template type mismatch
    template: section.template,
    context: {
      siteName: site.name,
      siteType: site.type.toLowerCase(),
      locationContext,
      language: languages[0]
    },
    languages
  });
  
  // Save generated content
  for (const { language, content } of result.contents) {
    if (content.success && content.data) {
      const existing = await prisma.sectionContent.findFirst({
        where: {
          sectionId: section.id,
          language
        }
      });
      
      if (existing) {
        await prisma.sectionContent.update({
          where: { id: existing.id },
          data: {
            data: content.data,
            imageUrls: [],
            generatedBy: 'gemini',
            generatedAt: new Date(),
            version: existing.version + 1
          }
        });
      } else {
        await prisma.sectionContent.create({
          data: {
            sectionId: section.id,
            language,
            data: content.data,
            imageUrls: [],
            generatedBy: 'gemini',
            generatedAt: new Date()
          }
        });
      }
    }
  }
}

// Export proxy objects for backward compatibility
export const contentGenerationQueue = new Proxy({} as Queue<ContentGenerationData>, {
  get(target, prop) {
    const queue = getContentGenerationQueue();
    if (!queue) {
      throw new Error('Content generation queue not available - Redis not configured');
    }
    return (queue as Queue<ContentGenerationData>)[prop as keyof Queue<ContentGenerationData>];
  }
});

export const contentGenerationWorker = new Proxy({} as Worker<ContentGenerationData>, {
  get(target, prop) {
    const worker = getContentGenerationWorker();
    if (!worker) {
      throw new Error('Content generation worker not available - Redis not configured');
    }
    return (worker as Worker<ContentGenerationData>)[prop as keyof Worker<ContentGenerationData>];
  }
});