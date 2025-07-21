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
  'AttractionHero': lazy(() => import('./sections/attraction-hero')),
  'QuickInfoBar': lazy(() => import('./sections/quick-info-bar-safe')),
  'ProductCards': lazy(() => import('./sections/product-cards-safe')),
  'TabbedInfo': lazy(() => import('./sections/tabbed-info-safe')),
  'ReviewsCarousel': lazy(() => import('./sections/reviews-carousel-safe')),
  'FAQAccordion': lazy(() => import('./sections/faq-accordion-safe')),
  'FinalCTA': lazy(() => import('./sections/final-cta')),
  
  // Map alternative names
  'HeroBanner': lazy(() => import('./sections/hero-banner')),
  'AttractionGrid': lazy(() => import('./sections/attraction-grid')),
  'AttractionsGrid': lazy(() => import('./sections/attractions-grid')),
  'ContentFeature': lazy(() => import('./sections/content-feature')),
  'FeaturesSection': lazy(() => import('./sections/features-section')),
  'TestimonialCarousel': lazy(() => import('./sections/testimonials-carousel')),
  'TestimonialsCarousel': lazy(() => import('./sections/testimonials-carousel')),
  'CTASection': lazy(() => import('./sections/cta-section')),
  'CTABanner': lazy(() => import('./sections/cta-section')),
  'OverviewSection': lazy(() => import('./sections/overview-section')),
  'HighlightsSection': lazy(() => import('./sections/highlights-section')),
  'PhotoGallery': lazy(() => import('./sections/photo-gallery')),
  'GalleryMasonry': lazy(() => import('./sections/photo-gallery')),
  'InfoSection': lazy(() => import('./sections/info-section')),
  'StatsCounter': lazy(() => import('./sections/statistics-bar')),
  'InteractiveMap': lazy(() => import('./sections/map-section')),
  'WeatherWidget': lazy(() => import('./sections/weather-widget')),
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