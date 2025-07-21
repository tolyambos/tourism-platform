import Replicate from 'replicate';
import sharp from 'sharp';
import pRetry from 'p-retry';
import { 
  ImageGenerationRequest, 
  ImageGenerationResponse 
} from '../types';
import { PromptBuilder } from '../utils/prompt-builder';

export interface ImageGeneratorConfig {
  apiToken: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

export class ImageGenerator {
  private replicate: Replicate;
  private config: Required<ImageGeneratorConfig>;
  
  constructor(config: ImageGeneratorConfig) {
    this.config = {
      apiToken: config.apiToken,
      model: config.model || 'black-forest-labs/flux-pro',
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 120000 // 2 minutes
    };
    
    this.replicate = new Replicate({
      auth: this.config.apiToken
    });
  }
  
  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    try {
      const result = await pRetry(
        async () => await this.generate(request),
        {
          retries: this.config.maxRetries,
          onFailedAttempt: (error) => {
            console.log(`Image generation attempt ${error.attemptNumber} failed. Retrying...`);
          }
        }
      );
      
      return result;
    } catch (error) {
      throw new Error(
        `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  private async generate(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const {
      prompt,
      negativePrompt,
      width = 1024,
      height = 768,
      model = this.config.model,
      seed
    } = request;
    
    // Apply model-specific constraints
    let constrainedWidth = width;
    let constrainedHeight = height;
    
    if (model === 'black-forest-labs/flux-pro') {
      // Flux Pro has a maximum width of 1440px
      constrainedWidth = Math.min(width, 1440);
      constrainedHeight = Math.min(height, 1440);
    }
    
    // Enhance the prompt for better results
    const enhancedPrompt = PromptBuilder.enhanceImagePrompt(prompt);
    
    // Prepare input based on model
    const input = this.prepareModelInput(model, {
      prompt: enhancedPrompt,
      negative_prompt: negativePrompt,
      width: constrainedWidth,
      height: constrainedHeight,
      seed,
      num_inference_steps: 50,
      guidance_scale: 7.5
    });
    
    // Run the model
    const output = await this.replicate.run(model as `${string}/${string}`, { 
      input,
      wait: { interval: 2000 }
    });
    
    // Extract the image URL
    const imageUrl = this.extractImageUrl(output);
    
    if (!imageUrl) {
      throw new Error('No image URL returned from model');
    }
    
    return {
      url: imageUrl,
      width: constrainedWidth,
      height: constrainedHeight,
      model,
      prompt: enhancedPrompt
    };
  }
  
  async generateBatch(
    requests: ImageGenerationRequest[],
    concurrency: number = 2
  ): Promise<ImageGenerationResponse[]> {
    const { default: PQueue } = await import('p-queue');
    const queue = new PQueue({ concurrency });
    
    const promises = requests.map(request =>
      queue.add(async () => this.generateImage(request))
    );
    
    return Promise.all(promises) as Promise<ImageGenerationResponse[]>;
  }
  
  async optimizeImage(
    imageUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<Buffer> {
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    
    let pipeline = sharp(buffer);
    
    // Resize if dimensions provided
    if (options.width || options.height) {
      pipeline = pipeline.resize(options.width, options.height, {
        fit: 'cover',
        position: 'center'
      });
    }
    
    // Convert format
    const format = options.format || 'webp';
    const quality = options.quality || 85;
    
    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, progressive: true });
        break;
      case 'png':
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
    }
    
    return pipeline.toBuffer();
  }
  
  async generateThumbnail(
    imageUrl: string,
    width: number = 400,
    height: number = 300
  ): Promise<Buffer> {
    return this.optimizeImage(imageUrl, {
      width,
      height,
      quality: 80,
      format: 'webp'
    });
  }
  
  private prepareModelInput(model: string, params: any): any {
    // Adjust input parameters based on the model
    switch (model) {
      case 'black-forest-labs/flux-pro':
      case 'black-forest-labs/flux-schnell':
        return {
          prompt: params.prompt,
          width: params.width,
          height: params.height,
          num_inference_steps: params.num_inference_steps,
          guidance_scale: params.guidance_scale,
          seed: params.seed
        };
        
      case 'stability-ai/sdxl':
        return {
          prompt: params.prompt,
          negative_prompt: params.negative_prompt,
          width: params.width,
          height: params.height,
          num_inference_steps: params.num_inference_steps,
          guidance_scale: params.guidance_scale,
          seed: params.seed,
          scheduler: 'DPMSolverMultistep'
        };
        
      default:
        return params;
    }
  }
  
  private extractImageUrl(output: any): string | null {
    // Handle different output formats from various models
    if (typeof output === 'string') {
      return output;
    }
    
    if (Array.isArray(output) && output.length > 0) {
      return output[0];
    }
    
    if (output && typeof output === 'object') {
      // Try common property names
      return output.output || output.image || output.url || null;
    }
    
    return null;
  }
  
  // Fallback to local image generation using placeholder service
  async generateFallbackImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const { width = 1024, height = 768, prompt } = request;
    
    // Use a placeholder service as fallback
    const text = encodeURIComponent(prompt.slice(0, 50));
    const url = `https://via.placeholder.com/${width}x${height}/0288d1/ffffff?text=${text}`;
    
    return {
      url,
      width,
      height,
      model: 'fallback',
      prompt
    };
  }
}