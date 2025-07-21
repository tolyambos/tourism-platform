import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiContentGenerator } from '../gemini-generator';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            headline: 'Test Headline',
            subheadline: 'Test Subheadline',
            ctaText: 'Learn More'
          }),
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 50,
            totalTokenCount: 150
          }
        }
      })
    })
  }))
}));

describe('GeminiContentGenerator', () => {
  let generator: GeminiContentGenerator;
  
  beforeEach(() => {
    generator = new GeminiContentGenerator({
      apiKey: 'test-api-key'
    });
  });
  
  it('should initialize with correct configuration', () => {
    expect(generator).toBeDefined();
    expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
  });
  
  it('should generate content successfully', async () => {
    const template = {
      id: 'test-template',
      name: 'hero-banner',
      displayName: 'Hero Banner',
      category: 'headers',
      description: 'Test template',
      systemPrompt: 'You are a travel content creator',
      userPromptTemplate: 'Generate content for {siteName}',
      componentName: 'HeroBanner',
      schema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          subheadline: { type: 'string' },
          ctaText: { type: 'string' }
        }
      },
      parsedSchema: null,
      defaultData: {},
      previewImage: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const context = {
      siteName: 'Rome Tourism',
      siteType: 'city',
      language: 'en',
      locationContext: 'Rome, Italy - The Eternal City'
    };
    
    const result = await generator.generateContent(template, context);
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      headline: 'Test Headline',
      subheadline: 'Test Subheadline',
      ctaText: 'Learn More'
    });
    expect(result.model).toBe('gemini-2.0-flash-exp');
    expect(result.usage).toEqual({
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150
    });
  });
  
  it('should handle generation errors gracefully', async () => {
    const mockModel = {
      generateContent: vi.fn().mockRejectedValue(new Error('API Error'))
    };
    
    vi.mocked(GoogleGenerativeAI).mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue(mockModel)
    }) as any);
    
    const generator = new GeminiContentGenerator({
      apiKey: 'test-api-key'
    });
    
    const template = {
      id: 'test-template',
      name: 'hero-banner',
      displayName: 'Hero Banner',
      category: 'headers',
      description: 'Test template',
      systemPrompt: 'You are a travel content creator',
      userPromptTemplate: 'Generate content for {siteName}',
      componentName: 'HeroBanner',
      schema: {},
      parsedSchema: null,
      defaultData: {},
      previewImage: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await generator.generateContent(template, {
      siteName: 'Test',
      siteType: 'city',
      language: 'en'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('API Error');
    expect(result.data).toBeNull();
  });
  
  it('should retry on failure with exponential backoff', async () => {
    let attempts = 0;
    const mockModel = {
      generateContent: vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return {
          response: {
            text: () => JSON.stringify({ headline: 'Success after retry' }),
            usageMetadata: null
          }
        };
      })
    };
    
    vi.mocked(GoogleGenerativeAI).mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue(mockModel)
    }) as any);
    
    const generator = new GeminiContentGenerator({
      apiKey: 'test-api-key',
      maxRetries: 3
    });
    
    const template = {
      id: 'test-template',
      name: 'hero-banner',
      displayName: 'Hero Banner',
      category: 'headers',
      description: 'Test template',
      systemPrompt: 'Test prompt',
      userPromptTemplate: 'Test template',
      componentName: 'HeroBanner',
      schema: {},
      parsedSchema: null,
      defaultData: {},
      previewImage: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await generator.generateContent(template, {
      siteName: 'Test',
      siteType: 'city',
      language: 'en'
    });
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ headline: 'Success after retry' });
    expect(mockModel.generateContent).toHaveBeenCalledTimes(3);
  });
});