import dynamic from 'next/dynamic';
import { Suspense, ComponentType } from 'react';

// Error boundary component
function ErrorFallback({ componentName, error }: { componentName: string; error?: any }) {
  return (
    <div className="p-4 m-2 bg-red-100 border border-red-400 rounded">
      <p className="text-red-700 font-semibold">Error loading {componentName}</p>
      {error && <p className="text-red-600 text-sm mt-1">{error.toString()}</p>}
    </div>
  );
}

// Loading component
function SectionSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 h-96 w-full" />
  );
}

// Safe component wrapper that ensures we always return a valid component
function createSafeComponent(componentName: string, importFn: () => Promise<any>): ComponentType<any> {
  const DynamicComponent = dynamic(
    async () => {
      try {
        const mod = await importFn();
        return mod;
      } catch (error) {
        console.error(`Failed to load ${componentName}:`, error);
        // Return a component that shows an error
        return {
          default: () => <ErrorFallback componentName={componentName} error={error} />
        };
      }
    },
    {
      loading: () => <SectionSkeleton />,
      ssr: true
    }
  );

  // Wrap the dynamic component to handle runtime errors
  return function SafeComponent(props: any) {
    try {
      return <DynamicComponent {...props} />;
    } catch (error) {
      console.error(`Runtime error in ${componentName}:`, error);
      return <ErrorFallback componentName={componentName} error={error} />;
    }
  };
}

// Define all section components with safe wrappers
const sectionComponents: Record<string, ComponentType<any>> = {
  'HeroBanner': createSafeComponent('HeroBanner', () => import('./sections/hero-banner')),
  'AttractionHero': createSafeComponent('AttractionHero', () => import('./sections/attraction-hero')),
  'AttractionGrid': createSafeComponent('AttractionGrid', () => import('./sections/attraction-grid')),
  'AttractionsGrid': createSafeComponent('AttractionsGrid', () => import('./sections/attractions-grid')),
  'ContentFeature': createSafeComponent('ContentFeature', () => import('./sections/content-feature')),
  'FeaturesSection': createSafeComponent('FeaturesSection', () => import('./sections/features-section')),
  'TestimonialCarousel': createSafeComponent('TestimonialCarousel', () => import('./sections/testimonials-carousel')),
  'TestimonialsCarousel': createSafeComponent('TestimonialsCarousel', () => import('./sections/testimonials-carousel')),
  'CTASection': createSafeComponent('CTASection', () => import('./sections/cta-section')),
  'CTABanner': createSafeComponent('CTABanner', () => import('./sections/cta-section')),
  'OverviewSection': createSafeComponent('OverviewSection', () => import('./sections/overview-section')),
  'HighlightsSection': createSafeComponent('HighlightsSection', () => import('./sections/highlights-section')),
  'PhotoGallery': createSafeComponent('PhotoGallery', () => import('./sections/photo-gallery')),
  'GalleryMasonry': createSafeComponent('GalleryMasonry', () => import('./sections/photo-gallery')),
  'InfoSection': createSafeComponent('InfoSection', () => import('./sections/info-section')),
  'FAQAccordion': createSafeComponent('FAQAccordion', () => import('./sections/faq-accordion')),
  'StatsCounter': createSafeComponent('StatsCounter', () => import('./sections/statistics-bar')),
  'InteractiveMap': createSafeComponent('InteractiveMap', () => import('./sections/map-section')),
  'WeatherWidget': createSafeComponent('WeatherWidget', () => import('./sections/weather-widget')),
  'QuickInfoBar': createSafeComponent('QuickInfoBar', () => import('./sections/quick-info-bar')),
  'ProductCards': createSafeComponent('ProductCards', () => import('./sections/product-cards')),
  'TabbedInfo': createSafeComponent('TabbedInfo', () => import('./sections/tabbed-info-safe')),
  'ReviewsCarousel': createSafeComponent('ReviewsCarousel', () => import('./sections/reviews-carousel')),
  'FinalCTA': createSafeComponent('FinalCTA', () => import('./sections/final-cta')),
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
    console.error('Section is undefined');
    return null;
  }

  if (!section.template || !section.template.componentName) {
    console.error('Missing template or componentName for section:', section.id);
    return null;
  }
  
  const componentName = section.template.componentName;
  
  // Get the component
  const Component = sectionComponents[componentName];
  
  if (!Component) {
    console.warn(`Component ${componentName} not found in mapping`);
    return (
      <div className="p-4 m-2 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-yellow-700">Component not found: {componentName}</p>
        <p className="text-yellow-600 text-sm">Available: {Object.keys(sectionComponents).join(', ')}</p>
      </div>
    );
  }
  
  // Get content for current locale with fallback to empty object
  const content = section.content?.find(c => c.language === locale);
  const contentData = content?.data || {};
  
  // Always render the component, even with empty data
  return (
    <div data-section-id={section.id} data-component={componentName}>
      <Component content={contentData} />
    </div>
  );
}