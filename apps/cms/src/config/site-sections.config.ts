// Configuration for which sections each site type should have
export const SITE_SECTIONS_CONFIG = {
  CITY: {
    sections: [
      { templateName: 'hero-banner', order: 0 },
      { templateName: 'attraction-grid', order: 1 },
      { templateName: 'content-feature', order: 2 },
      { templateName: 'testimonial-carousel', order: 3 },
      { templateName: 'faq', order: 4 },
      { templateName: 'cta-section', order: 5 }
    ],
    description: 'City guide website with attractions overview'
  },
  ATTRACTION: {
    sections: [
      { templateName: 'attraction-hero', order: 0 },
      { templateName: 'quick-info-bar', order: 1 },
      { templateName: 'product-cards', order: 2 },
      { templateName: 'tabbed-info', order: 3 },
      { templateName: 'reviews-carousel', order: 4 },
      { templateName: 'faq-accordion', order: 5 },
      { templateName: 'final-cta', order: 6 }
    ],
    description: 'Tourist attraction ticket booking website'
  }
} as const;

// Helper function to get section config for a site type
export function getSectionsForSiteType(siteType: 'CITY' | 'ATTRACTION') {
  return SITE_SECTIONS_CONFIG[siteType].sections;
}

// Helper function to get template names for a site type
export function getTemplateNamesForSiteType(siteType: 'CITY' | 'ATTRACTION') {
  return SITE_SECTIONS_CONFIG[siteType].sections.map(s => s.templateName);
}