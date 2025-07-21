import { prisma, Template, Section } from '@tourism/database';
import { GeminiContentGenerator } from '../generators/gemini-generator';
import { SectionContentGenerator } from '../generators/section-generator';
import { ImageGenerator } from '../generators/image-generator';
import { ContentValidator } from '../validators/content-validator';
import { R2Storage } from '../storage/r2-storage';
import { GenerationContext, TemplateWithSchema } from '../types';

export interface OrchestratorConfig {
  geminiApiKey: string;
  replicateApiToken: string;
  r2Config: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl?: string;
  };
}

export interface GenerateSiteContentOptions {
  siteId: string;
  languages: string[];
  regenerate?: boolean;
}

export class ContentOrchestrator {
  private sectionGenerator: SectionContentGenerator;
  private imageGenerator: ImageGenerator;
  private validator: ContentValidator;
  private storage: R2Storage;
  
  constructor(config: OrchestratorConfig) {
    this.sectionGenerator = new SectionContentGenerator({
      apiKey: config.geminiApiKey
    });
    
    this.imageGenerator = new ImageGenerator({
      apiToken: config.replicateApiToken
    });
    
    this.validator = new ContentValidator();
    
    this.storage = new R2Storage(config.r2Config);
  }
  
  async generateSiteContent(
    options: GenerateSiteContentOptions
  ): Promise<void> {
    const { siteId, languages, regenerate = false } = options;
    
    // Get site details
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        pages: {
          include: {
            sections: {
              include: {
                template: true,
                content: !regenerate
              }
            }
          }
        }
      }
    });
    
    if (!site) {
      throw new Error(`Site not found: ${siteId}`);
    }
    
    // Create base context
    const baseContext: GenerationContext = {
      siteName: site.name,
      siteType: site.type,
      locationContext: site.metadata as any || {},
      language: site.defaultLanguage
    };
    
    // Process each page
    for (const page of site.pages) {
      await this.generatePageContent(page, baseContext, languages, regenerate);
    }
  }
  
  private async generatePageContent(
    page: any,
    baseContext: GenerationContext,
    languages: string[],
    regenerate: boolean
  ): Promise<void> {
    console.log(`Generating content for page: ${page.slug}`);
    
    // Process each section
    for (const section of page.sections) {
      // Skip if content already exists and not regenerating
      if (!regenerate && section.content.length > 0) {
        console.log(`Skipping section ${section.id} - content already exists`);
        continue;
      }
      
      await this.generateSectionContent(section, baseContext, languages);
    }
  }
  
  private async generateSectionContent(
    section: any,
    baseContext: GenerationContext,
    languages: string[]
  ): Promise<void> {
    const template = section.template;
    
    console.log(`
=== CONTENT GENERATION START ===
Section ID: ${section.id}
Template Name: ${template.name}
Template Component: ${template.componentName}
Languages: ${languages.join(', ')}
Context: ${JSON.stringify(baseContext, null, 2)}
================================
`);
    
    // Generate content for all languages
    const result = await this.sectionGenerator.generateSectionContent({
      section,
      template,
      context: baseContext,
      languages
    });
    
    console.log(`
=== GENERATION RESULT ===
Section ID: ${result.sectionId}
Number of Contents: ${result.contents.length}
========================
`);
    
    // Process each language result
    for (const { language, content } of result.contents) {
      console.log(`
=== PROCESSING LANGUAGE: ${language} ===
Success: ${content.success}
Has Data: ${!!content.data}
Error: ${content.error || 'None'}
`);
      
      if (!content.success || !content.data) {
        console.error(`
=== GENERATION FAILED ===
Language: ${language}
Error: ${content.error}
Full Content Object: ${JSON.stringify(content, null, 2)}
========================
`);
        continue;
      }
      
      console.log(`
=== GENERATED CONTENT ===
Language: ${language}
Data Preview: ${JSON.stringify(content.data, null, 2).substring(0, 500)}...
========================
`);
      
      // Validate content
      const validation = await this.validator.validateContent(
        content.data,
        template
      );
      
      if (!validation.isValid) {
        console.error(`Content validation failed:`, validation.errors);
        continue;
      }
      
      // Extract and generate images
      const imageUrls = await this.processImages(
        validation.sanitizedContent || content.data,
        template.name
      );
      
      // Save to database
      await prisma.sectionContent.upsert({
        where: {
          sectionId_language: {
            sectionId: section.id,
            language
          }
        },
        create: {
          sectionId: section.id,
          language,
          data: validation.sanitizedContent || content.data,
          imageUrls,
          generatedBy: content.model
        },
        update: {
          data: validation.sanitizedContent || content.data,
          imageUrls,
          generatedBy: content.model,
          generatedAt: new Date(),
          version: {
            increment: 1
          }
        }
      });
      
      console.log(`Content saved for section ${section.id} in ${language}`);
    }
  }
  
  private async processImages(
    content: any,
    templateName: string
  ): Promise<string[]> {
    const imagePrompts = this.extractImagePrompts(content, templateName);
    const imageUrls: string[] = [];
    
    for (const prompt of imagePrompts) {
      try {
        // Generate image
        const imageResponse = await this.imageGenerator.generateImage({
          prompt,
          width: 1920,
          height: 1080
        });
        
        // Upload to R2
        const storedImage = await this.storage.uploadFromUrl(
          imageResponse.url!,
          {
            metadata: {
              prompt,
              model: 'replicate',
              templateName
            }
          }
        );
        
        imageUrls.push(storedImage.url);
        
        // Save to database
        await prisma.generatedImage.create({
          data: {
            prompt,
            model: 'replicate',
            url: storedImage.url,
            thumbnailUrl: storedImage.thumbnailUrl,
            width: 1920,
            height: 1080,
            metadata: {
              key: storedImage.key,
              size: storedImage.size
            }
          }
        });
      } catch (error) {
        console.error(`Failed to generate image for prompt "${prompt}":`, error);
        
        // Use fallback image
        const fallback = await this.imageGenerator.generateFallbackImage({
          prompt,
          width: 1920,
          height: 1080
        });
        
        imageUrls.push(fallback.url!);
      }
    }
    
    return imageUrls;
  }
  
  private extractImagePrompts(content: any, templateName: string): string[] {
    const prompts: string[] = [];
    
    switch (templateName) {
      case 'hero-banner':
        if (content.backgroundImagePrompt) {
          prompts.push(content.backgroundImagePrompt);
        }
        break;
        
      case 'attraction-grid':
        if (content.attractions && Array.isArray(content.attractions)) {
          content.attractions.forEach((attraction: any) => {
            if (attraction.imagePrompt) {
              prompts.push(attraction.imagePrompt);
            }
          });
        }
        break;
        
      case 'gallery-masonry':
        if (content.images && Array.isArray(content.images)) {
          content.images.forEach((image: any) => {
            if (image.prompt) {
              prompts.push(image.prompt);
            }
          });
        }
        break;
        
      case 'content-feature':
        if (content.features && Array.isArray(content.features)) {
          content.features.forEach((feature: any) => {
            if (feature.imagePrompt) {
              prompts.push(feature.imagePrompt);
            }
          });
        }
        break;
        
      case 'cta-banner':
        if (content.backgroundImagePrompt) {
          prompts.push(content.backgroundImagePrompt);
        }
        break;
        
      case 'overview':
        if (content.imagePrompts && Array.isArray(content.imagePrompts)) {
          prompts.push(...content.imagePrompts);
        }
        break;
        
      case 'AttractionHero':
      case 'attraction-hero':
        if (content.backgroundImagePrompt) {
          prompts.push(content.backgroundImagePrompt);
        }
        break;
        
      case 'ProductCards':
      case 'product-cards':
        if (content.productCards && Array.isArray(content.productCards)) {
          content.productCards.forEach((card: any) => {
            if (card.imagePrompts && Array.isArray(card.imagePrompts)) {
              prompts.push(...card.imagePrompts);
            }
          });
        }
        break;
        
      case 'TabbedInfo':
      case 'tabbed-info':
        if (content.showcaseImagePrompts) {
          if (content.showcaseImagePrompts.image1) prompts.push(content.showcaseImagePrompts.image1);
          if (content.showcaseImagePrompts.image2) prompts.push(content.showcaseImagePrompts.image2);
          if (content.showcaseImagePrompts.image3) prompts.push(content.showcaseImagePrompts.image3);
        }
        break;
        
      case 'FinalCTA':
      case 'final-cta':
        if (content.backgroundImagePrompt) {
          prompts.push(content.backgroundImagePrompt);
        }
        break;
    }
    
    return prompts;
  }
}