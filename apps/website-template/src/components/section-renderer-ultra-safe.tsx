'use client';

// Import all components statically
import AttractionHero from './sections/attraction-hero';
import QuickInfoBarSafe from './sections/quick-info-bar-safe';
import ProductCardsSafe from './sections/product-cards-safe';
import TabbedInfoSafe from './sections/tabbed-info-safe';
import ReviewsCarouselSafe from './sections/reviews-carousel-safe';
import FAQAccordionSafe from './sections/faq-accordion-safe';
import FinalCTA from './sections/final-cta';
// City components (for existing sites)
import HeroBanner from './sections/hero-banner';
import AttractionGrid from './sections/attraction-grid';

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

export default function SectionRenderer({ section, locale }: SectionRendererProps) {
  try {
    // Basic validation
    if (!section) {
      console.warn('SectionRenderer: No section provided');
      return null;
    }

    if (!section.template || !section.template.componentName) {
      console.warn('SectionRenderer: No template or componentName', section);
      return null;
    }
    
    const componentName = section.template.componentName;
    const content = section.content?.find(c => c.language === locale);
    const contentData = content?.data || {};
    
    console.log('SectionRenderer processing:', {
      sectionId: section.id,
      componentName,
      hasContent: !!content,
      contentKeys: Object.keys(contentData)
    });
    
    // Manual component mapping without dynamic imports
    switch (componentName) {
    case 'AttractionHero':
      return (
        <div data-section-id={section.id} data-component={componentName}>
          <AttractionHero content={contentData} />
        </div>
      );
    
    case 'QuickInfoBar':
      return (
        <div data-section-id={section.id} data-component={componentName}>
          <QuickInfoBarSafe content={contentData} />
        </div>
      );
    
    case 'ProductCards':
      return (
        <div data-section-id={section.id} data-component={componentName}>
          <ProductCardsSafe content={contentData} />
        </div>
      );
    
    case 'TabbedInfo':
      return (
        <div data-section-id={section.id} data-component={componentName}>
          <TabbedInfoSafe content={contentData} />
        </div>
      );
    
    case 'ReviewsCarousel':
      return (
        <div data-section-id={section.id} data-component={componentName}>
          <ReviewsCarouselSafe content={contentData} />
        </div>
      );
    
    case 'FAQAccordion':
      return (
        <div data-section-id={section.id} data-component={componentName}>
          <FAQAccordionSafe content={contentData} />
        </div>
      );
    
    case 'FinalCTA':
      return (
        <div data-section-id={section.id} data-component={componentName}>
          <FinalCTA content={contentData} />
        </div>
      );
    
    // City components
    case 'HeroBanner':
      return (
        <div data-section-id={section.id} data-component={componentName}>
          <HeroBanner content={contentData} />
        </div>
      );
    
    case 'AttractionGrid':
      return (
        <div data-section-id={section.id} data-component={componentName}>
          <AttractionGrid content={contentData} />
        </div>
      );
    
    default:
      return (
        <div className="p-4 m-2 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-700">Component not found: {componentName}</p>
        </div>
      );
    }
  } catch (error) {
    console.error('SectionRenderer error:', error);
    return (
      <div className="p-4 m-2 bg-red-100 border border-red-400 rounded">
        <p className="text-red-700">Error rendering section: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}