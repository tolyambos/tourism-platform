import { GenerationContext } from '../types';

export class PromptBuilder {
  static buildPrompt(template: string, context: GenerationContext): string {
    let prompt = template;
    
    // Replace all placeholders in the template with context values
    Object.entries(context).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      prompt = prompt.replace(placeholder, String(value));
    });
    
    // Add language instruction if not English
    if (context.language && context.language !== 'en') {
      prompt += `\n\nIMPORTANT: Generate all content in ${this.getLanguageName(context.language)} language.`;
    }
    
    // Add additional prompt if provided
    if (context.additionalPrompt) {
      prompt += `\n\nAdditional instructions: ${context.additionalPrompt}`;
    }
    
    return prompt;
  }
  
  private static getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'ko': 'Korean',
      'nl': 'Dutch',
      'pl': 'Polish',
      'tr': 'Turkish',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish'
    };
    
    return languages[code] || code;
  }
  
  static enhanceImagePrompt(basePrompt: string, style?: string): string {
    const defaultStyle = 'photorealistic, professional photography, high quality, detailed, sharp focus, vibrant colors';
    const enhancedPrompt = `${basePrompt}, ${style || defaultStyle}`;
    
    return enhancedPrompt;
  }
}