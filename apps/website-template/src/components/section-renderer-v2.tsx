import dynamic from 'next/dynamic';
import { ErrorBoundary } from './error-boundary';

// Loading component
function SectionSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 h-96 w-full" />
  );
}

// Dynamically import section components with proper options
const sectionComponents = {
  'HeroBanner': dynamic(() => import('./sections/hero-banner'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'AttractionHero': dynamic(() => import('./sections/attraction-hero'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'AttractionGrid': dynamic(() => import('./sections/attraction-grid'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'AttractionsGrid': dynamic(() => import('./sections/attractions-grid'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'ContentFeature': dynamic(() => import('./sections/content-feature'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'FeaturesSection': dynamic(() => import('./sections/features-section'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'TestimonialCarousel': dynamic(() => import('./sections/testimonials-carousel'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'TestimonialsCarousel': dynamic(() => import('./sections/testimonials-carousel'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'CTASection': dynamic(() => import('./sections/cta-section'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'CTABanner': dynamic(() => import('./sections/cta-section'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'OverviewSection': dynamic(() => import('./sections/overview-section'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'HighlightsSection': dynamic(() => import('./sections/highlights-section'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'PhotoGallery': dynamic(() => import('./sections/photo-gallery'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'GalleryMasonry': dynamic(() => import('./sections/photo-gallery'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'InfoSection': dynamic(() => import('./sections/info-section'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'FAQAccordion': dynamic(() => import('./sections/faq-accordion-safe'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'StatsCounter': dynamic(() => import('./sections/statistics-bar'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'InteractiveMap': dynamic(() => import('./sections/map-section'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'WeatherWidget': dynamic(() => import('./sections/weather-widget'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'QuickInfoBar': dynamic(() => import('./sections/quick-info-bar-safe'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'ProductCards': dynamic(() => import('./sections/product-cards'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'TabbedInfo': dynamic(() => import('./sections/tabbed-info-safe'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'ReviewsCarousel': dynamic(() => import('./sections/reviews-carousel-safe'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
  'FinalCTA': dynamic(() => import('./sections/final-cta'), {
    loading: () => <SectionSkeleton />,
    ssr: true
  }),
} as const;

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
  const Component = sectionComponents[componentName as keyof typeof sectionComponents];
  
  if (!Component) {
    console.warn(`Component ${componentName} not found in mapping`);
    return (
      <div className="p-4 m-2 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-yellow-700">Component not found: {componentName}</p>
      </div>
    );
  }
  
  // Get content for current locale with fallback to empty object
  const content = section.content?.find(c => c.language === locale);
  const contentData = content?.data || {};
  
  // Render with error boundary
  return (
    <ErrorBoundary componentName={componentName}>
      <div data-section-id={section.id} data-component={componentName}>
        <Component content={contentData} />
      </div>
    </ErrorBoundary>
  );
}