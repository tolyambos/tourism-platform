'use client';

// Test component that uses static imports to verify the approach
import AttractionHero from './sections/attraction-hero';

interface TestRendererProps {
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

export function TestRenderer({ section, locale }: TestRendererProps) {
  if (!section?.template?.componentName) {
    return null;
  }
  
  const content = section.content?.find(c => c.language === locale);
  const contentData = content?.data || {};
  
  // Just render AttractionHero for now as a test
  if (section.template.componentName === 'AttractionHero') {
    return (
      <div data-test="static-component">
        <AttractionHero content={contentData} />
      </div>
    );
  }
  
  return <div>Component type: {section.template.componentName}</div>;
}