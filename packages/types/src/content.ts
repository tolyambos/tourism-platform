export interface GenerationContext {
  siteName: string;
  siteType: string;
  locationContext: string;
  language: string;
  targetAudience?: string;
  additionalPrompt?: string;
}

export interface GeneratedContent {
  success: boolean;
  data: any;
  error?: string;
  generatedAt: Date;
  model: string;
}

export interface SectionData {
  id: string;
  templateId: string;
  content: Record<string, any>;
  language: string;
  imageUrls: string[];
}