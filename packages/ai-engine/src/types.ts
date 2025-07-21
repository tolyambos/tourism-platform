import { Template } from '@tourism/database';
import { z } from 'zod';

export interface GenerationContext {
  siteName: string;
  siteType: string;
  locationContext: any;
  language: string;
  targetAudience?: string;
  additionalPrompt?: string;
  [key: string]: any;
}

export interface GeneratedContent {
  success: boolean;
  data: any;
  error?: string;
  generatedAt: Date;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ContentGeneratorConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxRetries?: number;
  timeout?: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
}

export interface ImageGenerationResponse {
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  model: string;
  prompt: string;
}

export type TemplateWithSchema = Template & {
  parsedSchema?: z.ZodSchema;
};