'use client';

import { Suspense, lazy } from 'react';

// Import all components statically
import AttractionHero from './sections/attraction-hero';
import QuickInfoBarSafe from './sections/quick-info-bar-safe';
import ProductCardsSafe from './sections/product-cards-safe';
import TabbedInfoSafe from './sections/tabbed-info-safe';
import ReviewsCarouselSafe from './sections/reviews-carousel-safe';
import FAQAccordionSafe from './sections/faq-accordion-safe';
import FinalCTA from './sections/final-cta';

// Fallback components
function UnknownSection({ componentName }: { componentName: string }) {
  return (
    <div className="p-4 m-2 bg-yellow-100 border border-yellow-400 rounded">
      <p className="text-yellow-700">Unknown section type: {componentName}</p>
    </div>
  );
}

function LoadingSection() {
  return (
    <div className="animate-pulse bg-gray-100 h-96 w-full" />
  );
}

// Static mapping of components
const componentMap: Record<string, React.ComponentType<any>> = {
  'AttractionHero': AttractionHero,
  'QuickInfoBar': QuickInfoBarSafe,
  'ProductCards': ProductCardsSafe,
  'TabbedInfo': TabbedInfoSafe,
  'ReviewsCarousel': ReviewsCarouselSafe,
  'FAQAccordion': FAQAccordionSafe,
  'FinalCTA': FinalCTA,
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
  
  // Get component from static map
  const Component = componentMap[componentName];
  
  if (!Component) {
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