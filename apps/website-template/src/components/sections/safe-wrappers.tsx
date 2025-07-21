// Default content generators for each section type

export const getDefaultAttractionHeroContent = () => ({
  mainHeadline: 'Welcome to Our Attraction',
  subHeadline: 'Experience something amazing',
  price: '0',
  currency: 'EUR',
  keyFeatures: [],
  backgroundImage: '',
  backgroundImagePrompt: '',
  availableBadge: 'Available',
  ctaButtons: {
    primary: {
      text: 'Book Now',
      link: '#'
    },
    secondary: {
      text: 'Learn More',
      link: '#'
    }
  },
  disclaimer: 'Information subject to change'
});

export const getDefaultQuickInfoContent = () => ({
  duration: 'Duration varies',
  languages: ['English'],
  groupSize: 'All group sizes',
  features: []
});

export const getDefaultProductCardsContent = () => ({
  sectionTitle: 'Available Options',
  sectionDescription: 'Choose from our selection',
  badgeText: 'Popular',
  productCards: [],
  featuredWidget: {
    enabled: false,
    title: '',
    tourId: ''
  }
});

export const getDefaultReviewsContent = () => ({
  sectionTitle: 'Customer Reviews',
  sectionDescription: 'What our customers say',
  badgeText: 'Reviews',
  reviews: []
});

export const getDefaultFAQContent = () => ({
  sectionTitle: 'Frequently Asked Questions',
  sectionDescription: 'Find answers to common questions',
  badgeText: 'FAQ',
  faqs: []
});

export const getDefaultFinalCTAContent = () => ({
  headline: 'Ready to Book?',
  description: 'Start your journey today',
  ctaButton: {
    text: 'Book Now',
    link: '#'
  },
  backgroundImage: '',
  backgroundImagePrompt: '',
  trustIndicators: {
    averageRating: '5/5',
    freeCancellation: 'Free Cancellation',
    support: '24/7 Support'
  }
});

// Helper function to safely merge content with defaults
export function mergeWithDefaults<T extends Record<string, any>>(
  defaultContent: T,
  providedContent?: Partial<T>
): T {
  if (!providedContent) return defaultContent;
  
  const result: any = { ...defaultContent };
  
  Object.keys(providedContent).forEach(key => {
    const value = (providedContent as any)[key];
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
        result[key] = mergeWithDefaults((defaultContent as any)[key] || {}, value);
      } else {
        result[key] = value;
      }
    }
  });
  
  return result;
}