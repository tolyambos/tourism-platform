'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// Loading component
function SectionSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 h-96 w-full" />
  );
}

// Error component
function SectionError({ componentName }: { componentName: string }) {
  return (
    <div className="p-4 m-2 bg-yellow-100 border border-yellow-400 rounded">
      <p className="text-yellow-700">Unable to load component: {componentName}</p>
    </div>
  );
}

// Fallback component for any loading issues
function FallbackComponent({ componentName }: { componentName: string }) {
  return (
    <div className="p-8 text-center bg-gray-50 rounded-lg">
      <p className="text-gray-600">Section type: {componentName}</p>
    </div>
  );
}

// Create a failsafe dynamic import that always returns a component
function createFailsafeDynamic(importFn: () => Promise<any>, componentName: string) {
  return dynamic(
    async () => {
      try {
        const mod = await importFn();
        // Handle both default and named exports
        return mod.default || mod;
      } catch (error) {
        console.error(`Failed to load component ${componentName}:`, error);
        // Return a component that renders the fallback
        return () => <FallbackComponent componentName={componentName} />;
      }
    },
    {
      loading: () => <SectionSkeleton />,
      // This ensures we always have a component even if loading fails
      ssr: false,
    }
  );
}

// Failsafe section components mapping
const sectionComponents: Record<string, ComponentType<any>> = {
  'HeroBanner': createFailsafeDynamic(() => import('./sections/hero-banner'), 'HeroBanner'),
  'AttractionHero': createFailsafeDynamic(() => import('./sections/attraction-hero'), 'AttractionHero'),
  'AttractionGrid': createFailsafeDynamic(() => import('./sections/attraction-grid'), 'AttractionGrid'),
  'AttractionsGrid': createFailsafeDynamic(() => import('./sections/attractions-grid'), 'AttractionsGrid'),
  'ContentFeature': createFailsafeDynamic(() => import('./sections/content-feature'), 'ContentFeature'),
  'FeaturesSection': createFailsafeDynamic(() => import('./sections/features-section'), 'FeaturesSection'),
  'TestimonialCarousel': createFailsafeDynamic(() => import('./sections/testimonials-carousel'), 'TestimonialCarousel'),
  'TestimonialsCarousel': createFailsafeDynamic(() => import('./sections/testimonials-carousel'), 'TestimonialsCarousel'),
  'CTASection': createFailsafeDynamic(() => import('./sections/cta-section'), 'CTASection'),
  'CTABanner': createFailsafeDynamic(() => import('./sections/cta-section'), 'CTABanner'),
  'OverviewSection': createFailsafeDynamic(() => import('./sections/overview-section'), 'OverviewSection'),
  'HighlightsSection': createFailsafeDynamic(() => import('./sections/highlights-section'), 'HighlightsSection'),
  'PhotoGallery': createFailsafeDynamic(() => import('./sections/photo-gallery'), 'PhotoGallery'),
  'GalleryMasonry': createFailsafeDynamic(() => import('./sections/photo-gallery'), 'GalleryMasonry'),
  'InfoSection': createFailsafeDynamic(() => import('./sections/info-section'), 'InfoSection'),
  'FAQAccordion': createFailsafeDynamic(() => import('./sections/faq-accordion-safe'), 'FAQAccordion'),
  'StatsCounter': createFailsafeDynamic(() => import('./sections/statistics-bar'), 'StatsCounter'),
  'InteractiveMap': createFailsafeDynamic(() => import('./sections/map-section'), 'InteractiveMap'),
  'WeatherWidget': createFailsafeDynamic(() => import('./sections/weather-widget'), 'WeatherWidget'),
  'QuickInfoBar': createFailsafeDynamic(() => import('./sections/quick-info-bar-safe'), 'QuickInfoBar'),
  'ProductCards': createFailsafeDynamic(() => import('./sections/product-cards-safe'), 'ProductCards'),
  'TabbedInfo': createFailsafeDynamic(() => import('./sections/tabbed-info-safe'), 'TabbedInfo'),
  'ReviewsCarousel': createFailsafeDynamic(() => import('./sections/reviews-carousel-safe'), 'ReviewsCarousel'),
  'FinalCTA': createFailsafeDynamic(() => import('./sections/final-cta'), 'FinalCTA'),
};

interface SectionRendererProps {
  section: {
    id: string;
    template: {
      componentName: string;
    } | null;
    content: {
      language: string;
      data: any;
    }[];
  };
  locale: string;
}

export function SectionRenderer({ section, locale }: SectionRendererProps) {
  // Basic validation
  if (!section) {
    console.log('Section is null');
    return null;
  }

  if (!section.template || !section.template.componentName) {
    console.log('No template or componentName');
    return null;
  }
  
  const componentName = section.template.componentName;
  console.log('Rendering component:', componentName);
  
  // Get component from failsafe map - this will always return a component
  const Component = sectionComponents[componentName] || (() => <SectionError componentName={componentName} />);
  
  // Get content for current locale with fallback to empty object
  const content = section.content?.find(c => c.language === locale);
  const contentData = content?.data || {};
  
  // Render component - Component is guaranteed to be defined
  return (
    <div data-section-id={section.id} data-component={componentName}>
      <Component content={contentData} />
    </div>
  );
}