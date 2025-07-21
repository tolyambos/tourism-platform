import { z } from 'zod';
import { Template } from '@tourism/database';
import { SchemaConverter } from '../utils/schema-converter';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  sanitizedContent?: any;
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
}

export class ContentValidator {
  private schemaCache = new Map<string, z.ZodSchema>();
  
  async validateContent(
    content: any,
    template: Template
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    try {
      // Get or create Zod schema from template
      const zodSchema = this.getZodSchema(template);
      
      // Validate against schema
      const parseResult = zodSchema.safeParse(content);
      
      if (!parseResult.success) {
        parseResult.error.errors.forEach(error => {
          errors.push({
            path: error.path.join('.'),
            message: error.message,
            code: 'SCHEMA_VALIDATION_ERROR'
          });
        });
      }
      
      // Perform template-specific validation
      const templateValidation = await this.validateTemplateSpecific(
        content,
        template.name
      );
      
      errors.push(...templateValidation.errors);
      warnings.push(...templateValidation.warnings);
      
      // Sanitize content
      const sanitizedContent = parseResult.success 
        ? this.sanitizeContent(parseResult.data, template.name)
        : null;
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedContent
      };
    } catch (error) {
      errors.push({
        path: '',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        code: 'VALIDATION_ERROR'
      });
      
      return {
        isValid: false,
        errors,
        warnings
      };
    }
  }
  
  private getZodSchema(template: Template): z.ZodSchema {
    const cached = this.schemaCache.get(template.id);
    if (cached) return cached;
    
    const schema = SchemaConverter.jsonSchemaToZod(template.schema);
    this.schemaCache.set(template.id, schema);
    
    return schema;
  }
  
  private async validateTemplateSpecific(
    content: any,
    templateName: string
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    switch (templateName) {
      case 'hero-banner':
        this.validateHeroBanner(content, errors, warnings);
        break;
        
      case 'attraction-grid':
        this.validateAttractionGrid(content, errors, warnings);
        break;
        
      case 'map-interactive':
        this.validateMap(content, errors, warnings);
        break;
        
      case 'weather-widget':
        this.validateWeather(content, errors, warnings);
        break;
    }
    
    return { errors, warnings };
  }
  
  private validateHeroBanner(
    content: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Check headline length
    if (content.headline && content.headline.length > 60) {
      warnings.push({
        path: 'headline',
        message: 'Headline is longer than recommended 60 characters',
        code: 'HEADLINE_TOO_LONG'
      });
    }
    
    // Check subheadline length
    if (content.subheadline && content.subheadline.length > 150) {
      warnings.push({
        path: 'subheadline',
        message: 'Subheadline is longer than recommended 150 characters',
        code: 'SUBHEADLINE_TOO_LONG'
      });
    }
    
    // Validate CTA
    if (content.ctaText && content.ctaText.length > 20) {
      errors.push({
        path: 'ctaText',
        message: 'CTA text must be 20 characters or less',
        code: 'CTA_TOO_LONG'
      });
    }
  }
  
  private validateAttractionGrid(
    content: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!content.attractions || !Array.isArray(content.attractions)) {
      return;
    }
    
    content.attractions.forEach((attraction: any, index: number) => {
      // Validate rating
      if (attraction.rating !== undefined) {
        if (attraction.rating < 0 || attraction.rating > 5) {
          errors.push({
            path: `attractions[${index}].rating`,
            message: 'Rating must be between 0 and 5',
            code: 'INVALID_RATING'
          });
        }
      }
      
      // Validate price format
      if (attraction.price && !attraction.price.match(/^(free|\$+)$/i)) {
        warnings.push({
          path: `attractions[${index}].price`,
          message: 'Price should be "free" or use $ symbols (e.g., "$", "$$", "$$$")',
          code: 'INVALID_PRICE_FORMAT'
        });
      }
    });
  }
  
  private validateMap(
    content: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Validate center coordinates
    if (content.center) {
      if (!this.isValidLatitude(content.center.lat)) {
        errors.push({
          path: 'center.lat',
          message: 'Invalid latitude. Must be between -90 and 90',
          code: 'INVALID_LATITUDE'
        });
      }
      
      if (!this.isValidLongitude(content.center.lng)) {
        errors.push({
          path: 'center.lng',
          message: 'Invalid longitude. Must be between -180 and 180',
          code: 'INVALID_LONGITUDE'
        });
      }
    }
    
    // Validate markers
    if (content.markers && Array.isArray(content.markers)) {
      content.markers.forEach((marker: any, index: number) => {
        if (!this.isValidLatitude(marker.lat)) {
          errors.push({
            path: `markers[${index}].lat`,
            message: 'Invalid latitude',
            code: 'INVALID_MARKER_LAT'
          });
        }
        
        if (!this.isValidLongitude(marker.lng)) {
          errors.push({
            path: `markers[${index}].lng`,
            message: 'Invalid longitude',
            code: 'INVALID_MARKER_LNG'
          });
        }
      });
    }
  }
  
  private validateWeather(
    content: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!content.climateData?.monthly) return;
    
    // Check if we have 12 months
    if (content.climateData.monthly.length !== 12) {
      errors.push({
        path: 'climateData.monthly',
        message: 'Must have exactly 12 months of data',
        code: 'INVALID_MONTH_COUNT'
      });
    }
    
    // Validate temperature ranges
    content.climateData.monthly.forEach((month: any, index: number) => {
      if (month.highTemp < month.lowTemp) {
        errors.push({
          path: `climateData.monthly[${index}]`,
          message: 'High temperature must be greater than low temperature',
          code: 'INVALID_TEMP_RANGE'
        });
      }
      
      // Check for reasonable temperature values
      if (month.highTemp > 60 || month.lowTemp < -60) {
        warnings.push({
          path: `climateData.monthly[${index}]`,
          message: 'Temperature values seem extreme',
          code: 'EXTREME_TEMPERATURE'
        });
      }
    });
  }
  
  private sanitizeContent(content: any, templateName: string): any {
    const sanitized = { ...content };
    
    // Perform template-specific sanitization
    switch (templateName) {
      case 'hero-banner':
        if (sanitized.headline) {
          sanitized.headline = this.sanitizeText(sanitized.headline);
        }
        if (sanitized.subheadline) {
          sanitized.subheadline = this.sanitizeText(sanitized.subheadline);
        }
        break;
        
      case 'attraction-grid':
        if (sanitized.attractions && Array.isArray(sanitized.attractions)) {
          sanitized.attractions = sanitized.attractions.map((attr: any) => ({
            ...attr,
            name: this.sanitizeText(attr.name),
            description: this.sanitizeText(attr.description)
          }));
        }
        break;
    }
    
    return sanitized;
  }
  
  private sanitizeText(text: string): string {
    // Remove any HTML tags
    const withoutHtml = text.replace(/<[^>]*>/g, '');
    
    // Trim whitespace
    const trimmed = withoutHtml.trim();
    
    // Replace multiple spaces with single space
    return trimmed.replace(/\s+/g, ' ');
  }
  
  private isValidLatitude(lat: number): boolean {
    return typeof lat === 'number' && lat >= -90 && lat <= 90;
  }
  
  private isValidLongitude(lng: number): boolean {
    return typeof lng === 'number' && lng >= -180 && lng <= 180;
  }
}