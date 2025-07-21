import dynamic from 'next/dynamic';

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

// Simple section components mapping without complex wrappers
const sectionComponents: Record<string, any> = {
  'HeroBanner': dynamic(() => import('./sections/hero-banner'), {
    loading: () => <SectionSkeleton />,
  }),
  'AttractionHero': dynamic(() => import('./sections/attraction-hero'), {
    loading: () => <SectionSkeleton />,
  }),
  'AttractionGrid': dynamic(() => import('./sections/attraction-grid'), {
    loading: () => <SectionSkeleton />,
  }),
  'AttractionsGrid': dynamic(() => import('./sections/attractions-grid'), {
    loading: () => <SectionSkeleton />,
  }),
  'ContentFeature': dynamic(() => import('./sections/content-feature'), {
    loading: () => <SectionSkeleton />,
  }),
  'FeaturesSection': dynamic(() => import('./sections/features-section'), {
    loading: () => <SectionSkeleton />,
  }),
  'TestimonialCarousel': dynamic(() => import('./sections/testimonials-carousel'), {
    loading: () => <SectionSkeleton />,
  }),
  'TestimonialsCarousel': dynamic(() => import('./sections/testimonials-carousel'), {
    loading: () => <SectionSkeleton />,
  }),
  'CTASection': dynamic(() => import('./sections/cta-section'), {
    loading: () => <SectionSkeleton />,
  }),
  'CTABanner': dynamic(() => import('./sections/cta-section'), {
    loading: () => <SectionSkeleton />,
  }),
  'OverviewSection': dynamic(() => import('./sections/overview-section'), {
    loading: () => <SectionSkeleton />,
  }),
  'HighlightsSection': dynamic(() => import('./sections/highlights-section'), {
    loading: () => <SectionSkeleton />,
  }),
  'PhotoGallery': dynamic(() => import('./sections/photo-gallery'), {
    loading: () => <SectionSkeleton />,
  }),
  'GalleryMasonry': dynamic(() => import('./sections/photo-gallery'), {
    loading: () => <SectionSkeleton />,
  }),
  'InfoSection': dynamic(() => import('./sections/info-section'), {
    loading: () => <SectionSkeleton />,
  }),
  'FAQAccordion': dynamic(() => import('./sections/faq-accordion-safe'), {
    loading: () => <SectionSkeleton />,
  }),
  'StatsCounter': dynamic(() => import('./sections/statistics-bar'), {
    loading: () => <SectionSkeleton />,
  }),
  'InteractiveMap': dynamic(() => import('./sections/map-section'), {
    loading: () => <SectionSkeleton />,
  }),
  'WeatherWidget': dynamic(() => import('./sections/weather-widget'), {
    loading: () => <SectionSkeleton />,
  }),
  'QuickInfoBar': dynamic(() => import('./sections/quick-info-bar-safe'), {
    loading: () => <SectionSkeleton />,
  }),
  'ProductCards': dynamic(() => import('./sections/product-cards-safe'), {
    loading: () => <SectionSkeleton />,
  }),
  'TabbedInfo': dynamic(() => import('./sections/tabbed-info-safe'), {
    loading: () => <SectionSkeleton />,
  }),
  'ReviewsCarousel': dynamic(() => import('./sections/reviews-carousel-safe'), {
    loading: () => <SectionSkeleton />,
  }),
  'FinalCTA': dynamic(() => import('./sections/final-cta'), {
    loading: () => <SectionSkeleton />,
  }),
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
    return null;
  }

  if (!section.template || !section.template.componentName) {
    return null;
  }
  
  const componentName = section.template.componentName;
  const Component = sectionComponents[componentName];
  
  if (!Component) {
    return <SectionError componentName={componentName} />;
  }
  
  // Get content for current locale with fallback to empty object
  const content = section.content?.find(c => c.language === locale);
  const contentData = content?.data || {};
  
  // Simple render without error boundary
  return (
    <div data-section-id={section.id} data-component={componentName}>
      <Component content={contentData} />
    </div>
  );
}