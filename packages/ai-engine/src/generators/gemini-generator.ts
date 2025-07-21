import { GoogleGenAI } from '@google/genai';
import { Template } from '@tourism/database';
import pRetry from 'p-retry';
import { 
  GenerationContext, 
  GeneratedContent, 
  ContentGeneratorConfig,
  TemplateWithSchema 
} from '../types';
import { PromptBuilder } from '../utils/prompt-builder';
import { SchemaConverter } from '../utils/schema-converter';

export class GeminiContentGenerator {
  private ai: GoogleGenAI;
  private config: Required<ContentGeneratorConfig>;
  
  constructor(config: ContentGeneratorConfig) {
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'gemini-2.5-pro',
      temperature: config.temperature || 0.7,
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 30000
    };
    
    this.ai = new GoogleGenAI({
      apiKey: this.config.apiKey
    });
  }
  
  async generateContent(
    template: TemplateWithSchema,
    context: GenerationContext
  ): Promise<GeneratedContent> {
    try {
      const result = await pRetry(
        async () => await this.generate(template, context),
        {
          retries: this.config.maxRetries,
          onFailedAttempt: (error) => {
            console.log(`Attempt ${error.attemptNumber} failed. Retrying...`);
          }
        }
      );
      
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        generatedAt: new Date(),
        model: this.config.model
      };
    }
  }
  
  private async generate(
    template: TemplateWithSchema,
    context: GenerationContext
  ): Promise<GeneratedContent> {
    // Build the user prompt
    const userPrompt = PromptBuilder.buildPrompt(
      template.userPromptTemplate,
      context
    );
    
    // Generate content using the EXACT API structure
    const response = await this.ai.models.generateContent({
      model: this.config.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userPrompt
            }
          ]
        }
      ],
      config: {
        temperature: this.config.temperature,
        responseMimeType: 'application/json',
        responseSchema: template.schema,
        systemInstruction: template.systemPrompt ? [{ text: template.systemPrompt }] : undefined
      }
    });
    
    const text = response.text || '';
    
    if (!text) {
      throw new Error('No response text received from Gemini');
    }
    
    try {
      // Parse the JSON response
      const data = JSON.parse(text);
      
      // Validate against schema if available
      if (template.parsedSchema) {
        const validation = SchemaConverter.validateContent(
          template.parsedSchema,
          data
        );
        
        if (!validation.success) {
          throw new Error(`Schema validation failed: ${validation.errors}`);
        }
      }
      
      return {
        success: true,
        data,
        generatedAt: new Date(),
        model: this.config.model,
        usage: response.usageMetadata ? {
          promptTokens: response.usageMetadata.promptTokenCount || 0,
          completionTokens: response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata.totalTokenCount || 0
        } : undefined
      };
    } catch (error) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            data,
            generatedAt: new Date(),
            model: this.config.model
          };
        } catch {
          // Continue to error handling
        }
      }
      
      throw new Error(`Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async generateBatch(
    templates: Array<{ template: TemplateWithSchema; context: GenerationContext }>,
    concurrency: number = 3
  ): Promise<GeneratedContent[]> {
    const { default: PQueue } = await import('p-queue');
    const queue = new PQueue({ concurrency });
    
    const promises = templates.map(({ template, context }) =>
      queue.add(async () => this.generateContent(template, context))
    );
    
    return Promise.all(promises) as Promise<GeneratedContent[]>;
  }
  
  async generateStructuredContent(params: {
    model: string;
    config: any;
    contents: any[];
  }): Promise<any> {
    try {
      console.log(`
=== GEMINI STRUCTURED GENERATION ===
Model: ${params.model}
Has Response Schema: ${!!params.config.responseSchema}
System Instruction: ${params.config.systemInstruction[0].text.substring(0, 100)}...
User Content: ${JSON.stringify(params.contents[0].parts[0].text).substring(0, 200)}...
====================================
`);
      
      console.log('Calling Gemini API...');
      
      // Use EXACT API structure from documentation
      const response = await this.ai.models.generateContent({
        model: params.model,
        contents: params.contents,
        config: {
          responseMimeType: params.config.responseMimeType,
          responseSchema: params.config.responseSchema,
          temperature: this.config.temperature,
          maxOutputTokens: 8192,
          systemInstruction: params.config.systemInstruction
        }
      });
      
      console.log('Got Gemini response, extracting text...');
      
      const text = response.text || '';
      
      if (!text) {
        throw new Error('No response text received from Gemini');
      }
      
      console.log(`Response text (first 500 chars): ${text.substring(0, 500)}...`);
      
      // Parse the JSON response
      const parsed = JSON.parse(text);
      console.log('Successfully parsed JSON response');
      
      return parsed;
    } catch (error) {
      console.error(`
=== GEMINI API ERROR ===
Error Type: ${error instanceof Error ? error.constructor.name : 'Unknown'}
Error Message: ${error instanceof Error ? error.message : String(error)}
Error Details: ${JSON.stringify(error, null, 2)}
========================
`);
      throw error;
    }
  }
}