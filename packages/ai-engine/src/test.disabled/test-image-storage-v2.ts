import 'dotenv/config';
import { ImageGenerator } from '../generators/image-generator-v2';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load the CMS .env file
dotenv.config({ path: path.join(__dirname, '../../../../apps/cms/.env') });

async function testImageAndStorage() {
  console.log('🖼️  Testing Image Generation with Google Imagen 4...\n');
  
  const replicateKey = process.env.REPLICATE_API_TOKEN;
  
  if (!replicateKey) {
    console.error('❌ REPLICATE_API_TOKEN not found');
    return;
  }
  
  const imageGenerator = new ImageGenerator({
    apiToken: replicateKey
  });
  
  try {
    // Test 1: Generate an image
    console.log('1️⃣  Generating test image...');
    const imageResult = await imageGenerator.generateImage({
      prompt: 'Aerial view of Barcelona cityscape at sunset, Sagrada Familia in the distance, golden hour lighting, professional travel photography',
      width: 1024,
      height: 768,
      aspectRatio: '4:3'
    });
    
    if (imageResult.success) {
      console.log('✅ Image generated:', imageResult.filename || imageResult.url);
      console.log('   Source:', imageResult.source);
      console.log('   Cached:', imageResult.cached);
      if (imageResult.size) {
        console.log(`   Size: ${(imageResult.size / 1024).toFixed(2)} KB`);
      }
    }
    
    // Test 2: Test caching
    console.log('\n2️⃣  Testing cache (same prompt)...');
    const cachedResult = await imageGenerator.generateImage({
      prompt: 'Aerial view of Barcelona cityscape at sunset, Sagrada Familia in the distance, golden hour lighting, professional travel photography',
      width: 1024,
      height: 768,
      aspectRatio: '4:3'
    });
    
    console.log('✅ Cache test:', cachedResult.cached ? 'Using cached image' : 'Generated new image');
    
    // Test 3: Force regeneration
    console.log('\n3️⃣  Testing force regeneration...');
    const regeneratedResult = await imageGenerator.generateImage({
      prompt: 'Beautiful Mediterranean beach with crystal clear water, palm trees, white sand',
      width: 1024,
      height: 768,
      aspectRatio: '4:3',
      forceRegenerate: true
    });
    
    console.log('✅ Force regeneration:', regeneratedResult.success ? 'Success' : 'Failed');
    
    // Test 4: Different aspect ratios
    console.log('\n4️⃣  Testing different aspect ratios...');
    const squareResult = await imageGenerator.generateImage({
      prompt: 'Modern tourism logo design, minimalist style, travel icon',
      width: 512,
      height: 512,
      aspectRatio: '1:1',
      style: 'minimalist modern logo design'
    });
    
    console.log('✅ Square image (1:1):', squareResult.success ? 'Success' : 'Failed');
    
    // Test 5: Fallback handling
    console.log('\n5️⃣  Testing fallback (intentionally problematic prompt)...');
    const fallbackResult = await imageGenerator.generateImage({
      prompt: 'test_' + Math.random(), // Random prompt to potentially trigger fallback
      width: 800,
      height: 600
    });
    
    console.log('✅ Fallback test:', fallbackResult.source);
    if (fallbackResult.fallback) {
      console.log('   Search terms:', fallbackResult.searchTerms);
    }
    
    console.log('\n✨ All image generation tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testImageAndStorage().catch(console.error);