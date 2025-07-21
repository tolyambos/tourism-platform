export interface SiteConfig {
  id: string;
  name: string;
  domain?: string;
  subdomain: string;
  type: 'CITY' | 'ATTRACTION' | 'REGION' | 'CUSTOM';
  languages: string[];
  defaultLanguage: string;
  theme: ThemeConfig;
  features: FeatureConfig;
  seoSettings: SEOConfig;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  darkMode: boolean;
}

export interface FeatureConfig {
  blog: boolean;
  events: boolean;
  booking: boolean;
  reviews: boolean;
  newsletter: boolean;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  favicon?: string;
}