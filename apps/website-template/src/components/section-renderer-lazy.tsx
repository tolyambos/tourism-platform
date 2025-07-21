'use client';

import { Suspense, lazy, ComponentType } from 'react';

// Fallback components
function UnknownSection({ componentName }: { componentName: string }) {
  return (
    <div className="p-4 m-2 bg-yellow-100 border border-yellow-400 rounded">
      <p className="text-yellow-700">Component not configured: {componentName}</p>
      <p className="text-yellow-600 text-sm mt-1">This section type is not yet implemented.</p>
    </div>
  );
}

function LoadingSection() {
  return (
    <div className="animate-pulse bg-gray-100 h-96 w-full" />
  );
}

function ErrorSection({ error }: { error: any }) {
  return (
    <div className="p-4 m-2 bg-red-100 border border-red-400 rounded">
      <p className="text-red-700">Error loading section</p>
      <p className="text-red-600 text-sm mt-1">{error?.message || 'Unknown error'}</p>
    </div>
  );
}

// Lazy load components with error handling
const lazyComponents: Record<string, ComponentType<any>> = {
  'AttractionHero': lazy(() => import('./sections/attraction-hero').catch(() => ({ default: ErrorSection }))),
  'QuickInfoBar': lazy(() => import('./sections/quick-info-bar-safe').catch(() => ({ default: ErrorSection }))),
  'ProductCards': lazy(() => import('./sections/product-cards-safe').catch(() => ({ default: ErrorSection }))),
  'TabbedInfo': lazy(() => import('./sections/tabbed-info-safe').catch(() => ({ default: ErrorSection }))),
  'ReviewsCarousel': lazy(() => import('./sections/reviews-carousel-safe').catch(() => ({ default: ErrorSection }))),
  'FAQAccordion': lazy(() => import('./sections/faq-accordion-safe').catch(() => ({ default: ErrorSection }))),
  'FinalCTA': lazy(() => import('./sections/final-cta').catch(() => ({ default: ErrorSection }))),
  
  // Map alternative names
  'HeroBanner': lazy(() => import('./sections/hero-banner').catch(() => ({ default: ErrorSection }))),
  'AttractionGrid': lazy(() => import('./sections/attraction-grid').catch(() => ({ default: ErrorSection }))),
  'AttractionsGrid': lazy(() => import('./sections/attractions-grid').catch(() => ({ default: ErrorSection }))),
  'ContentFeature': lazy(() => import('./sections/content-feature').catch(() => ({ default: ErrorSection }))),
  'FeaturesSection': lazy(() => import('./sections/features-section').catch(() => ({ default: ErrorSection }))),
  'TestimonialCarousel': lazy(() => import('./sections/testimonials-carousel').catch(() => ({ default: ErrorSection }))),
  'TestimonialsCarousel': lazy(() => import('./sections/testimonials-carousel').catch(() => ({ default: ErrorSection }))),
  'CTASection': lazy(() => import('./sections/cta-section').catch(() => ({ default: ErrorSection }))),
  'CTABanner': lazy(() => import('./sections/cta-section').catch(() => ({ default: ErrorSection }))),
  'OverviewSection': lazy(() => import('./sections/overview-section').catch(() => ({ default: ErrorSection }))),
  'HighlightsSection': lazy(() => import('./sections/highlights-section').catch(() => ({ default: ErrorSection }))),
  'PhotoGallery': lazy(() => import('./sections/photo-gallery').catch(() => ({ default: ErrorSection }))),
  'GalleryMasonry': lazy(() => import('./sections/photo-gallery').catch(() => ({ default: ErrorSection }))),
  'InfoSection': lazy(() => import('./sections/info-section').catch(() => ({ default: ErrorSection }))),
  'StatsCounter': lazy(() => import('./sections/statistics-bar').catch(() => ({ default: ErrorSection }))),
  'InteractiveMap': lazy(() => import('./sections/map-section').catch(() => ({ default: ErrorSection }))),
  'WeatherWidget': lazy(() => import('./sections/weather-widget').catch(() => ({ default: ErrorSection }))),
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
  
  // Get component from lazy map
  const Component = lazyComponents[componentName];
  
  if (!Component) {
    console.log('Component not found in map:', componentName);
    return <UnknownSection componentName={componentName} />;
  }
  
  // Get content for current locale with fallback to empty object
  const content = section.content?.find(c => c.language === locale);
  const contentData = content?.data || {};
  
  // Render with Suspense
  return (
    <Suspense fallback={<LoadingSection />}>
      <div data-section-id={section.id} data-component={componentName}>
        <Component content={contentData} />
      </div>
    </Suspense>
  );
}