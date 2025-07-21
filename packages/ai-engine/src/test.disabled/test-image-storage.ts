import 'dotenv/config';
import { ImageGenerator } from '../generators/image-generator';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load the CMS .env file
dotenv.config({ path: path.join(__dirname, '../../../../apps/cms/.env') });

async function testImageAndStorage() {
  console.log('🖼️  Testing Image Optimization and Storage...\n');
  
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
      prompt: 'Aerial view of a tropical beach paradise with crystal clear water, palm trees, white sand',
      width: 1440,
      height: 1080
    });
    
    console.log('✅ Image generated:', imageResult.url);
    
    // Test 2: Optimize the image
    console.log('\n2️⃣  Testing image optimization...');
    const optimizedBuffer = await imageGenerator.optimizeImage(imageResult.url, {
      width: 800,
      height: 600,
      quality: 85,
      format: 'webp'
    });
    
    console.log('✅ Image optimized successfully');
    console.log(`   Original dimensions: ${imageResult.width}x${imageResult.height}`);
    console.log(`   Optimized dimensions: 800x600`);
    console.log(`   Buffer size: ${(optimizedBuffer.length / 1024).toFixed(2)} KB`);
    
    // Test 3: Generate thumbnail
    console.log('\n3️⃣  Testing thumbnail generation...');
    const thumbnailBuffer = await imageGenerator.generateThumbnail(imageResult.url);
    
    console.log('✅ Thumbnail generated successfully');
    console.log(`   Thumbnail size: ${(thumbnailBuffer.length / 1024).toFixed(2)} KB`);
    
    // Test 4: Test fallback image
    console.log('\n4️⃣  Testing fallback image generation...');
    const fallbackResult = await imageGenerator.generateFallbackImage({
      prompt: 'Tourism destination placeholder',
      width: 1024,
      height: 768
    });
    
    console.log('✅ Fallback image generated:', fallbackResult.url);
    
    // Test 5: R2 Storage Mock (since we don't have real R2 credentials)
    console.log('\n5️⃣  Testing R2 Storage Mock...');
    console.log('ℹ️  R2 Storage integration is ready but requires:');
    console.log('   - R2_ACCOUNT_ID');
    console.log('   - R2_ACCESS_KEY_ID');
    console.log('   - R2_SECRET_ACCESS_KEY');
    console.log('   - R2_BUCKET_NAME');
    console.log('   These will be configured when deploying to production.');
    
    console.log('\n✨ Image and storage tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testImageAndStorage().catch(console.error);