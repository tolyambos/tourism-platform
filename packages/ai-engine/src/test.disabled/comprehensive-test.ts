import 'dotenv/config';
import { GeminiContentGenerator } from '../generators/gemini-generator';
import { ImageGenerator } from '../generators/image-generator';
import { ContentValidator } from '../validators/content-validator';
import { SectionContentGenerator } from '../generators/section-generator';
import { prisma } from '@tourism/database';
import { GenerationContext } from '../types';

// Load environment variables from CMS
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the CMS .env file
dotenv.config({ path: path.join(__dirname, '../../../../apps/cms/.env') });

async function runComprehensiveTest() {
  console.log('🧪 Starting Comprehensive AI Engine Test...\n');
  
  // Check if API keys are loaded
  const geminiKey = process.env.GEMINI_API_KEY;
  const replicateKey = process.env.REPLICATE_API_TOKEN;
  
  if (!geminiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    return;
  }
  
  if (!replicateKey) {
    console.error('❌ REPLICATE_API_TOKEN not found');
    return;
  }
  
  console.log('✅ API keys loaded successfully\n');
  
  try {
    // Test 1: Gemini Content Generation
    console.log('📝 Test 1: Testing Gemini Content Generation...');
    const geminiGenerator = new GeminiContentGenerator({
      apiKey: geminiKey,
      temperature: 0.8
    });
    
    // Get a template from database
    const template = await prisma.template.findFirst({
      where: { name: 'hero-banner' }
    });
    
    if (!template) {
      throw new Error('Template not found in database');
    }
    
    const context: GenerationContext = {
      siteName: 'Beautiful Barcelona',
      siteType: 'city',
      locationContext: 'Barcelona, Spain - A vibrant city known for Gaudí architecture, beaches, and tapas',
      language: 'en'
    };
    
    const result = await geminiGenerator.generateContent(template as any, context);
    
    if (result.success) {
      console.log('✅ Content generated successfully!');
      console.log('Generated data:', JSON.stringify(result.data, null, 2));
    } else {
      console.error('❌ Generation failed:', result.error);
    }
    
    // Test 2: Content Validation
    console.log('\n📋 Test 2: Testing Content Validation...');
    const validator = new ContentValidator();
    const validation = await validator.validateContent(result.data, template);
    
    if (validation.isValid) {
      console.log('✅ Content validation passed!');
    } else {
      console.error('❌ Validation errors:', validation.errors);
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Validation warnings:', validation.warnings);
    }
    
    // Test 3: Section Content Generator
    console.log('\n🏗️  Test 3: Testing Section Content Generator...');
    const sectionGenerator = new SectionContentGenerator({
      apiKey: geminiKey
    });
    
    // Create a mock section
    const mockSection = {
      id: 'test-section-1',
      order: 1,
      template
    };
    
    const sectionResult = await sectionGenerator.generateSectionContent({
      section: mockSection as any,
      template,
      context,
      languages: ['en', 'es']
    });
    
    console.log(`✅ Generated content for ${sectionResult.contents.length} languages`);
    sectionResult.contents.forEach(({ language, content }) => {
      console.log(`  - ${language}: ${content.success ? 'Success' : 'Failed'}`);
    });
    
    // Test 4: Image Generation (with fallback)
    console.log('\n🖼️  Test 4: Testing Image Generation...');
    const imageGenerator = new ImageGenerator({
      apiToken: replicateKey
    });
    
    try {
      // Test with a simple prompt first
      const imageResult = await imageGenerator.generateImage({
        prompt: 'Beautiful sunset over Barcelona city skyline, golden hour, photorealistic',
        width: 1024,
        height: 768,
        aspectRatio: '4:3'
      });
      
      if (imageResult.success) {
        console.log('✅ Image generated successfully!');
        console.log('Image source:', imageResult.source);
        console.log('Image filename:', imageResult.filename || imageResult.url);
      } else {
        console.log('⚠️  Image generation returned failure status');
      }
    } catch (error) {
      console.log('⚠️  Image generation failed, testing fallback...');
      const fallbackResult = await imageGenerator.generateFallbackImage({
        prompt: 'Barcelona skyline',
        width: 1024,
        height: 768
      });
      console.log('✅ Fallback image generated:', fallbackResult.url);
    }
    
    // Test 5: Multiple Templates
    console.log('\n🔄 Test 5: Testing Multiple Templates...');
    const templates = await prisma.template.findMany({
      take: 3
    });
    
    for (const tmpl of templates) {
      console.log(`\nTesting template: ${tmpl.name}`);
      const result = await geminiGenerator.generateContent(tmpl as any, {
        ...context,
        attractionCount: 6,
        featureCount: 3,
        testimonialCount: 5,
        faqCount: 8,
        statCount: 4,
        imageCount: 9,
        conversionGoal: 'book a trip',
        markerCount: 10,
        centerCoords: '41.3851, 2.1734',
        region: 'Mediterranean'
      });
      
      if (result.success) {
        console.log(`  ✅ ${tmpl.name} generated successfully`);
        
        // Validate the content
        const validation = await validator.validateContent(result.data, tmpl);
        if (validation.isValid) {
          console.log(`  ✅ ${tmpl.name} validation passed`);
        } else {
          console.log(`  ❌ ${tmpl.name} validation failed:`, validation.errors.slice(0, 2));
        }
      } else {
        console.log(`  ❌ ${tmpl.name} generation failed:`, result.error);
      }
    }
    
    console.log('\n✨ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
runComprehensiveTest().catch(console.error);