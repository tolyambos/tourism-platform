import { Template, Section, SectionContent } from '@tourism/database';
import { GeminiContentGenerator } from './gemini-generator';
import { 
  GenerationContext, 
  GeneratedContent,
  ContentGeneratorConfig,
  TemplateWithSchema
} from '../types';
import {
  attractionHeroPrompt,
  quickInfoBarPrompt,
  productCardsPrompt,
  tabbedInfoPrompt,
  reviewsCarouselPrompt,
  faqAccordionPrompt,
  finalCTAPrompt
} from '../gemini/section-prompts';

export interface SectionGenerationRequest {
  section: Section;
  template: Template;
  context: GenerationContext;
  languages: string[];
}

export interface SectionGenerationResult {
  sectionId: string;
  contents: Array<{
    language: string;
    content: GeneratedContent;
  }>;
}

export class SectionContentGenerator {
  private geminiGenerator: GeminiContentGenerator;
  
  constructor(config: ContentGeneratorConfig) {
    this.geminiGenerator = new GeminiContentGenerator(config);
  }
  
  async generateSectionContent(
    request: SectionGenerationRequest
  ): Promise<SectionGenerationResult> {
    const { section, template, context, languages } = request;
    const contents: Array<{ language: string; content: GeneratedContent }> = [];
    
    // Check if this is one of our new tourism sections
    const tourismSections = [
      'AttractionHero',
      'QuickInfoBar', 
      'ProductCards',
      'TabbedInfo',
      'ReviewsCarousel',
      'FAQAccordion',
      'FinalCTA'
    ];
    
    console.log(`
=== SECTION GENERATOR ===
Template Name: ${template.name}
Template Component Name: ${template.componentName}
Is Tourism Section: ${tourismSections.includes(template.name) || tourismSections.includes(template.componentName)}
========================
`);
    
    // Check both template.name and template.componentName
    if (tourismSections.includes(template.name) || tourismSections.includes(template.componentName)) {
      console.log('Using TOURISM section generator');
      // Use our new structured generation
      return this.generateTourismSectionContent(request);
    }
    
    console.log('Using DEFAULT section generator');
    
    // Generate content for each language using old method
    for (const language of languages) {
      const languageContext = {
        ...context,
        language,
        sectionOrder: section.order,
        sectionId: section.id
      };
      
      const content = await this.geminiGenerator.generateContent(
        template as TemplateWithSchema,
        languageContext
      );
      
      // Post-process content based on template type
      if (content.success && content.data) {
        content.data = await this.postProcessContent(
          template.name,
          content.data,
          languageContext
        );
      }
      
      contents.push({ language, content });
    }
    
    return {
      sectionId: section.id,
      contents
    };
  }
  
  private async generateTourismSectionContent(
    request: SectionGenerationRequest
  ): Promise<SectionGenerationResult> {
    const { section, template, context, languages } = request;
    const results: Array<{ language: string; content: GeneratedContent }> = [];
    
    // Map template names to prompt configs
    const promptMap: Record<string, any> = {
      'AttractionHero': attractionHeroPrompt,
      'QuickInfoBar': quickInfoBarPrompt,
      'ProductCards': productCardsPrompt,
      'TabbedInfo': tabbedInfoPrompt,
      'ReviewsCarousel': reviewsCarouselPrompt,
      'FAQAccordion': faqAccordionPrompt,
      'FinalCTA': finalCTAPrompt
    };
    
    // Try both template.name and template.componentName
    const promptConfig = promptMap[template.name] || promptMap[template.componentName];
    if (!promptConfig) {
      throw new Error(`No prompt config found for template: ${template.name} or ${template.componentName}`);
    }
    
    console.log(`
=== TOURISM GENERATOR ===
Using prompt config for: ${template.name || template.componentName}
========================
`);
    
    // Extract attraction and location from context
    const attraction = context.siteName || 'Tourist Attraction';
    const location = typeof context.locationContext === 'object' && context.locationContext?.city 
      ? context.locationContext.city 
      : 'City';
    
    console.log(`
=== CONTEXT INFO ===
Attraction: ${attraction}
Location: ${location}
===================
`);
    
    // Generate content for each language
    for (const language of languages) {
      try {
        console.log(`\n=== GENERATING FOR LANGUAGE: ${language} ===`);
        
        const config = {
          responseMimeType: 'application/json',
          responseSchema: promptConfig.responseSchema,
          systemInstruction: [
            {
              text: promptConfig.systemInstruction
            }
          ]
        };
        
        const userPrompt = promptConfig.userPrompt(attraction, location);
        console.log(`User Prompt: ${userPrompt}`);
        
        const contents = [
          {
            role: 'user',
            parts: [
              {
                text: userPrompt
              }
            ]
          }
        ];
        
        console.log('Calling Gemini API...');
        
        // Call Gemini API directly
        const response = await this.geminiGenerator.generateStructuredContent({
          model: 'gemini-2.5-pro',
          config,
          contents
        });
        
        console.log(`Gemini Response received: ${JSON.stringify(response, null, 2).substring(0, 200)}...`);
        
        const generatedContent: GeneratedContent = {
          success: true,
          data: response,
          model: 'gemini-2.5-pro',
          generatedAt: new Date(),
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
          }
        };
        
        results.push({ language, content: generatedContent });
      } catch (error) {
        console.error(`
=== GENERATION ERROR ===
Template: ${template.name}
Language: ${language}
Error Type: ${error instanceof Error ? error.constructor.name : 'Unknown'}
Error Message: ${error instanceof Error ? error.message : String(error)}
Error Stack: ${error instanceof Error ? error.stack : 'No stack trace'}
=======================
`);
        results.push({
          language,
          content: {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            model: 'gemini-2.5-pro',
            generatedAt: new Date()
          }
        });
      }
    }
    
    return {
      sectionId: section.id,
      contents: results
    };
  }
  
  async generateMultipleSections(
    requests: SectionGenerationRequest[],
    concurrency: number = 3
  ): Promise<SectionGenerationResult[]> {
    const { default: PQueue } = await import('p-queue');
    const queue = new PQueue({ concurrency });
    
    const promises = requests.map(request =>
      queue.add(async () => this.generateSectionContent(request))
    );
    
    return Promise.all(promises) as Promise<SectionGenerationResult[]>;
  }
  
  private async postProcessContent(
    templateName: string,
    content: any,
    context: GenerationContext
  ): Promise<any> {
    // Add template-specific post-processing
    switch (templateName) {
      case 'hero-banner':
        return this.postProcessHeroBanner(content, context);
        
      case 'attraction-grid':
        return this.postProcessAttractionGrid(content, context);
        
      case 'gallery-masonry':
        return this.postProcessGallery(content, context);
        
      case 'map-interactive':
        return this.postProcessMap(content, context);
        
      default:
        return content;
    }
  }
  
  private postProcessHeroBanner(content: any, context: GenerationContext): any {
    // Ensure CTA link is properly formatted
    if (!content.ctaLink && context.siteType) {
      content.ctaLink = '#explore';
    }
    
    // Set default overlay opacity if not provided
    if (content.overlayOpacity === undefined) {
      content.overlayOpacity = 0.4;
    }
    
    return content;
  }
  
  private postProcessAttractionGrid(content: any, context: GenerationContext): any {
    // Ensure all attractions have required fields
    if (content.attractions && Array.isArray(content.attractions)) {
      content.attractions = content.attractions.map((attraction: any, index: number) => ({
        ...attraction,
        id: attraction.id || `attraction-${index + 1}`,
        rating: attraction.rating || 4.5,
        price: attraction.price || '$',
        duration: attraction.duration || '2-3 hours'
      }));
    }
    
    return content;
  }
  
  private postProcessGallery(content: any, context: GenerationContext): any {
    // Ensure all images have required fields
    if (content.images && Array.isArray(content.images)) {
      content.images = content.images.map((image: any, index: number) => ({
        ...image,
        id: image.id || `image-${index + 1}`,
        alt: image.alt || `${context.siteName} gallery image ${index + 1}`
      }));
    }
    
    return content;
  }
  
  private postProcessMap(content: any, context: GenerationContext): any {
    // Set default zoom level if not provided
    if (!content.zoom) {
      content.zoom = 13;
    }
    
    // Ensure all markers have required fields
    if (content.markers && Array.isArray(content.markers)) {
      content.markers = content.markers.map((marker: any, index: number) => ({
        ...marker,
        id: marker.id || `marker-${index + 1}`,
        icon: marker.icon || this.getDefaultIcon(marker.category)
      }));
    }
    
    return content;
  }
  
  private getDefaultIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'attraction': 'landmark',
      'restaurant': 'utensils',
      'hotel': 'bed',
      'shopping': 'shopping-bag',
      'transport': 'train',
      'park': 'trees',
      'museum': 'building-2',
      'beach': 'umbrella-beach',
      'nightlife': 'music',
      'default': 'map-pin'
    };
    
    return iconMap[category.toLowerCase()] || iconMap.default;
  }
}