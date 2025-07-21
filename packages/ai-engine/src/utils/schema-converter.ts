import { z } from 'zod';

export class SchemaConverter {
  static jsonSchemaToZod(jsonSchema: any): z.ZodSchema {
    return this.convertSchema(jsonSchema);
  }
  
  private static convertSchema(schema: any): z.ZodSchema {
    if (!schema || typeof schema !== 'object') {
      return z.any();
    }
    
    switch (schema.type) {
      case 'string':
        let stringSchema = z.string();
        if (schema.minLength) stringSchema = stringSchema.min(schema.minLength);
        if (schema.maxLength) stringSchema = stringSchema.max(schema.maxLength);
        if (schema.pattern) stringSchema = stringSchema.regex(new RegExp(schema.pattern));
        if (schema.enum) return z.enum(schema.enum as [string, ...string[]]);
        return stringSchema;
        
      case 'number':
      case 'integer':
        let numberSchema = schema.type === 'integer' ? z.number().int() : z.number();
        if (schema.minimum !== undefined) numberSchema = numberSchema.min(schema.minimum);
        if (schema.maximum !== undefined) numberSchema = numberSchema.max(schema.maximum);
        return numberSchema;
        
      case 'boolean':
        return z.boolean();
        
      case 'array':
        let arraySchema = z.array(this.convertSchema(schema.items || {}));
        if (schema.minItems) arraySchema = arraySchema.min(schema.minItems);
        if (schema.maxItems) arraySchema = arraySchema.max(schema.maxItems);
        return arraySchema;
        
      case 'object':
        if (schema.properties) {
          const shape: Record<string, z.ZodSchema> = {};
          const required = schema.required || [];
          
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            const zodSchema = this.convertSchema(propSchema);
            shape[key] = required.includes(key) ? zodSchema : zodSchema.optional();
          }
          
          return z.object(shape);
        }
        return z.record(z.any());
        
      default:
        return z.any();
    }
  }
  
  static validateContent(schema: z.ZodSchema, content: any): { 
    success: boolean; 
    data?: any; 
    errors?: z.ZodError 
  } {
    try {
      const data = schema.parse(content);
      return { success: true, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }
}