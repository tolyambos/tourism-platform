import { GeminiContentGenerator } from '../generators/gemini-generator';
import { Template } from '@tourism/database';
import { GenerationContext } from '../types';

// This is a simple test script to verify the AI engine works
async function testContentGeneration() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set');
    return;
  }
  
  const generator = new GeminiContentGenerator({
    apiKey,
    temperature: 0.8
  });
  
  // Test template
  const template: Template = {
    id: 'test-1',
    name: 'hero-banner',
    displayName: 'Hero Banner',
    category: 'headers',
    description: 'Test hero banner',
    schema: {
      type: 'object',
      required: ['headline', 'subheadline', 'ctaText'],
      properties: {
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        ctaText: { type: 'string' },
        ctaLink: { type: 'string' },
        backgroundImagePrompt: { type: 'string' }
      }
    },
    defaultData: {},
    systemPrompt: 'You are an expert travel content creator. Create engaging, inspiring content.',
    userPromptTemplate: 'Generate hero banner content for {siteName}, a {siteType} tourism website. Create a compelling headline (max 10 words), subheadline (max 25 words), and call-to-action.',
    componentName: 'HeroBanner',
    previewImage: null,
    isActive: true,
    sections: [],
    createdAt: new Date(),
    updatedAt: new Date()
  } as any;
  
  const context: GenerationContext = {
    siteName: 'Beautiful Paris',
    siteType: 'city',
    locationContext: 'Paris, France - City of Light, romance, art, and culture',
    language: 'en'
  };
  
  console.log('Testing content generation...');
  
  const result = await generator.generateContent(template as any, context);
  
  if (result.success) {
    console.log('✅ Generation successful!');
    console.log('Generated content:', JSON.stringify(result.data, null, 2));
    console.log('Model:', result.model);
    if (result.usage) {
      console.log('Token usage:', result.usage);
    }
  } else {
    console.error('❌ Generation failed:', result.error);
  }
}

// Run the test
testContentGeneration().catch(console.error);