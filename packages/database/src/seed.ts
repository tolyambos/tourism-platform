import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  // Hero Templates
  {
    name: 'hero',
    displayName: 'Hero Banner',
    category: 'headers',
    componentName: 'HeroBanner',
    schema: {
      type: 'object',
      required: ['headline', 'subheadline', 'ctaText', 'backgroundImagePrompt'],
      properties: {
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        ctaText: { type: 'string' },
        ctaLink: { type: 'string' },
        backgroundImagePrompt: { type: 'string' },
        overlayOpacity: { type: 'number', minimum: 0, maximum: 1 }
      }
    },
    defaultData: {
      overlayOpacity: 0.4
    },
    systemPrompt: `You are an expert travel content creator specializing in creating compelling hero sections for tourism websites. Create engaging, SEO-optimized content that immediately captures visitor attention and conveys the unique appeal of the destination.`,
    userPromptTemplate: `Generate hero banner content for a tourism website about {locationContext}. The content should be inspiring, capture the essence of the destination, and encourage visitors to explore more. Include a compelling headline, descriptive subheadline, and action-oriented CTA text. Also provide a detailed image generation prompt for the background.`,
    isActive: true
  },
  
  // Attractions Grid
  {
    name: 'attractions-grid',
    displayName: 'Attractions Grid',
    category: 'content',
    componentName: 'AttractionsGrid',
    schema: {
      type: 'object',
      required: ['sectionTitle', 'sectionDescription', 'attractions'],
      properties: {
        sectionTitle: { type: 'string' },
        sectionDescription: { type: 'string' },
        attractions: {
          type: 'array',
          minItems: 6,
          maxItems: 12,
          items: {
            type: 'object',
            required: ['name', 'description', 'imagePrompt', 'category', 'highlights'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              imagePrompt: { type: 'string' },
              category: { type: 'string' },
              highlights: {
                type: 'array',
                items: { type: 'string' }
              },
              visitDuration: { type: 'string' },
              bestTimeToVisit: { type: 'string' }
            }
          }
        }
      }
    },
    defaultData: {},
    systemPrompt: `You are a tourism expert creating comprehensive attraction listings. Focus on diverse, must-see attractions that showcase the destination's unique character. Provide practical information and vivid descriptions.`,
    userPromptTemplate: `Generate a grid of top attractions for {locationContext}. Include 8-10 diverse attractions covering historical sites, cultural venues, natural landmarks, and modern attractions. For each, provide engaging descriptions, key highlights, and practical visitor information.`,
    isActive: true
  },
  
  // Features Section
  {
    name: 'features',
    displayName: 'Features Section',
    category: 'content',
    componentName: 'FeaturesSection',
    schema: {
      type: 'object',
      required: ['sectionTitle', 'sectionDescription', 'features'],
      properties: {
        sectionTitle: { type: 'string' },
        sectionDescription: { type: 'string' },
        features: {
          type: 'array',
          minItems: 4,
          maxItems: 6,
          items: {
            type: 'object',
            required: ['title', 'description', 'icon'],
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              icon: { 
                type: 'string',
                enum: ['map', 'calendar', 'globe', 'users', 'star', 'heart', 'camera', 'sun', 'moon', 'cloud']
              }
            }
          }
        }
      }
    },
    defaultData: {},
    systemPrompt: `You are creating feature highlights for a tourism destination. Focus on unique selling points and practical benefits that make this destination special and worth visiting.`,
    userPromptTemplate: `Generate key features and highlights for visiting {locationContext}. Include 4-6 compelling features that showcase what makes this destination unique, such as cultural experiences, natural beauty, activities, cuisine, or practical advantages.`,
    isActive: true
  },
  
  // Testimonials
  {
    name: 'testimonials',
    displayName: 'Testimonials Carousel',
    category: 'social-proof',
    componentName: 'TestimonialsCarousel',
    schema: {
      type: 'object',
      required: ['sectionTitle', 'sectionDescription', 'testimonials'],
      properties: {
        sectionTitle: { type: 'string' },
        sectionDescription: { type: 'string' },
        testimonials: {
          type: 'array',
          minItems: 6,
          maxItems: 10,
          items: {
            type: 'object',
            required: ['content', 'author', 'origin', 'rating'],
            properties: {
              content: { type: 'string' },
              author: { type: 'string' },
              origin: { type: 'string' },
              rating: { type: 'number', minimum: 4, maximum: 5 },
              visitDate: { type: 'string' }
            }
          }
        }
      }
    },
    defaultData: {},
    systemPrompt: `Create authentic-sounding testimonials from diverse international visitors. Focus on specific experiences, emotions, and memorable moments. Vary the writing styles and perspectives.`,
    userPromptTemplate: `Generate 8 realistic testimonials from visitors to {locationContext}. Include diverse perspectives from different types of travelers (families, couples, solo travelers, business visitors). Make them specific, emotional, and authentic.`,
    isActive: true
  },
  
  // CTA Section
  {
    name: 'cta',
    displayName: 'Call to Action',
    category: 'conversion',
    componentName: 'CTASection',
    schema: {
      type: 'object',
      required: ['headline', 'description', 'primaryButtonText', 'secondaryButtonText', 'backgroundImagePrompt'],
      properties: {
        headline: { type: 'string' },
        description: { type: 'string' },
        primaryButtonText: { type: 'string' },
        primaryButtonLink: { type: 'string' },
        secondaryButtonText: { type: 'string' },
        secondaryButtonLink: { type: 'string' },
        backgroundImagePrompt: { type: 'string' }
      }
    },
    defaultData: {
      primaryButtonLink: '/contact',
      secondaryButtonLink: '/guides'
    },
    systemPrompt: `Create compelling call-to-action content that motivates visitors to take the next step in their journey planning. Be persuasive but not pushy.`,
    userPromptTemplate: `Generate a call-to-action section for {locationContext}. Create an irresistible invitation to visit, with compelling copy and clear action buttons. Include both primary and secondary CTAs.`,
    isActive: true
  },
  
  // Overview Section (for Attractions)
  {
    name: 'overview',
    displayName: 'Overview Section',
    category: 'content',
    componentName: 'OverviewSection',
    schema: {
      type: 'object',
      required: ['title', 'introduction', 'keyFacts', 'imagePrompts'],
      properties: {
        title: { type: 'string' },
        introduction: { type: 'string' },
        keyFacts: {
          type: 'array',
          minItems: 4,
          maxItems: 8,
          items: {
            type: 'object',
            required: ['label', 'value'],
            properties: {
              label: { type: 'string' },
              value: { type: 'string' }
            }
          }
        },
        imagePrompts: {
          type: 'array',
          minItems: 2,
          maxItems: 3,
          items: { type: 'string' }
        }
      }
    },
    defaultData: {},
    systemPrompt: `You are creating an overview section for a specific attraction. Provide comprehensive yet concise information that gives visitors a complete understanding of what to expect.`,
    userPromptTemplate: `Generate an overview section for {locationContext}. Include a compelling introduction, key facts (like opening hours, ticket prices, historical dates, visitor numbers), and image prompts for 2-3 supporting images.`,
    isActive: true
  },
  
  // Gallery Section
  {
    name: 'gallery',
    displayName: 'Photo Gallery',
    category: 'media',
    componentName: 'PhotoGallery',
    schema: {
      type: 'object',
      required: ['sectionTitle', 'sectionDescription', 'images'],
      properties: {
        sectionTitle: { type: 'string' },
        sectionDescription: { type: 'string' },
        images: {
          type: 'array',
          minItems: 8,
          maxItems: 12,
          items: {
            type: 'object',
            required: ['caption', 'imagePrompt', 'category'],
            properties: {
              caption: { type: 'string' },
              imagePrompt: { type: 'string' },
              category: { type: 'string' }
            }
          }
        }
      }
    },
    defaultData: {},
    systemPrompt: `Create a diverse photo gallery that showcases different aspects of the destination. Include various perspectives, times of day, and seasonal variations where relevant.`,
    userPromptTemplate: `Generate a photo gallery for {locationContext}. Include 10 diverse images covering architecture, landscapes, culture, food, people, and activities. Provide detailed image generation prompts and informative captions.`,
    isActive: true
  },
  
  // Info Section
  {
    name: 'info',
    displayName: 'Practical Information',
    category: 'information',
    componentName: 'InfoSection',
    schema: {
      type: 'object',
      required: ['sectionTitle', 'categories'],
      properties: {
        sectionTitle: { type: 'string' },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            required: ['title', 'items'],
            properties: {
              title: { type: 'string' },
              icon: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['label', 'value'],
                  properties: {
                    label: { type: 'string' },
                    value: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    defaultData: {},
    systemPrompt: `Provide comprehensive practical information for visitors. Be specific, accurate, and helpful. Include all essential details visitors need to plan their visit.`,
    userPromptTemplate: `Generate practical information sections for {locationContext}. Include categories like Getting There, Opening Hours, Tickets & Pricing, Best Time to Visit, What to Bring, and Accessibility. Be specific and helpful.`,
    isActive: true
  },
  
  // Highlights Section
  {
    name: 'highlights',
    displayName: 'Key Highlights',
    category: 'content',
    componentName: 'HighlightsSection',
    schema: {
      type: 'object',
      required: ['sectionTitle', 'sectionDescription', 'highlights'],
      properties: {
        sectionTitle: { type: 'string' },
        sectionDescription: { type: 'string' },
        highlights: {
          type: 'array',
          minItems: 4,
          maxItems: 6,
          items: {
            type: 'object',
            required: ['title', 'description', 'imagePrompt', 'details'],
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              imagePrompt: { type: 'string' },
              details: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        }
      }
    },
    defaultData: {},
    systemPrompt: `Create detailed highlights that showcase the most important and interesting aspects of the attraction. Focus on unique features, historical significance, and visitor experiences.`,
    userPromptTemplate: `Generate 4-6 key highlights for {locationContext}. Each highlight should focus on a unique aspect like architecture, history, art collections, views, or special features. Include rich descriptions and specific details.`,
    isActive: true
  },
  
  // New Attraction Templates
  {
    name: 'attraction-hero',
    displayName: 'Attraction Hero',
    category: 'headers',
    componentName: 'AttractionHero',
    schema: {
      type: 'object',
      required: ['mainHeadline', 'subHeadline', 'price', 'currency', 'keyFeatures', 'backgroundImagePrompt', 'availableBadge', 'ctaButtons', 'disclaimer'],
      properties: {
        mainHeadline: { type: 'string' },
        subHeadline: { type: 'string' },
        price: { type: 'string' },
        currency: { type: 'string' },
        keyFeatures: {
          type: 'array',
          minItems: 3,
          maxItems: 5,
          items: { type: 'string' }
        },
        backgroundImagePrompt: { type: 'string' },
        availableBadge: { type: 'string' },
        ctaButtons: {
          type: 'object',
          properties: {
            primary: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                link: { type: 'string' }
              }
            },
            secondary: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                link: { type: 'string' }
              }
            }
          }
        },
        disclaimer: { type: 'string' }
      }
    },
    defaultData: {
      currency: '€',
      availableBadge: 'Available Today',
      ctaButtons: {
        primary: {
          text: 'See Tickets & Prices',
          link: '#featured-experiences'
        },
        secondary: {
          text: 'Buy Tickets',
          link: '#'
        }
      },
      disclaimer: 'This is not an official website. All content is for informational purposes only. We may earn commission from bookings.'
    },
    systemPrompt: `Create compelling hero content for a tourist attraction landing page. Focus on the main appeal, pricing, and key features that make this attraction special.`,
    userPromptTemplate: `Generate hero section content for {locationContext}. Include an inspiring headline, descriptive subheadline, starting price, 4 key features, and a dramatic background image prompt. Make it compelling and conversion-focused.`,
    isActive: true
  },
  
  {
    name: 'quick-info-bar',
    displayName: 'Quick Info Bar',
    category: 'information',
    componentName: 'QuickInfoBar',
    schema: {
      type: 'object',
      required: ['duration', 'languages', 'groupSize', 'features'],
      properties: {
        duration: { type: 'string' },
        languages: {
          type: 'array',
          items: { type: 'string' }
        },
        groupSize: { type: 'string' },
        features: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    },
    defaultData: {
      features: ['Free Cancellation']
    },
    systemPrompt: `Create quick, scannable information about the attraction visit details.`,
    userPromptTemplate: `Generate quick info for {locationContext} including typical visit duration, available tour languages, group size information, and key features like free cancellation.`,
    isActive: true
  },
  
  {
    name: 'product-cards',
    displayName: 'Product Cards',
    category: 'content',
    componentName: 'ProductCards',
    schema: {
      type: 'object',
      required: ['sectionTitle', 'sectionDescription', 'badgeText', 'productCards'],
      properties: {
        sectionTitle: { type: 'string' },
        sectionDescription: { type: 'string' },
        badgeText: { type: 'string' },
        featuredWidget: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            title: { type: 'string' },
            tourId: { type: 'string' }
          }
        },
        productCards: {
          type: 'array',
          minItems: 2,
          maxItems: 4,
          items: {
            type: 'object',
            required: ['name', 'description', 'rating', 'reviewCount', 'price', 'currency', 'duration', 'imagePrompts', 'features'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              rating: { type: 'number' },
              reviewCount: { type: 'number' },
              price: { type: 'string' },
              oldPrice: { type: 'string' },
              currency: { type: 'string' },
              priceType: { type: 'string', enum: ['per_person', 'per_group', 'per_vehicle'] },
              startsFrom: { type: 'boolean' },
              duration: { type: 'string' },
              imagePrompts: {
                type: 'array',
                minItems: 3,
                items: { type: 'string' }
              },
              badges: {
                type: 'array',
                items: { type: 'string' }
              },
              features: {
                type: 'object',
                properties: {
                  freeCancellation: { type: 'boolean' },
                  instantConfirmation: { type: 'boolean' },
                  hotelPickup: { type: 'boolean' }
                }
              },
              highlights: {
                type: 'array',
                items: { type: 'string' }
              },
              directUrl: { type: 'string' },
              affiliateUrl: { type: 'string' }
            }
          }
        }
      }
    },
    defaultData: {
      badgeText: 'Featured Experiences',
      sectionTitle: 'Popular Tours & Activities',
      sectionDescription: 'Handpicked experiences with excellent reviews'
    },
    systemPrompt: `Create detailed product cards for different tour options and tickets for the attraction. Include varied price points and tour types.`,
    userPromptTemplate: `Generate 3 different tour/ticket options for {locationContext}. Include standard entry, guided tours, and premium experiences. Vary the prices, durations, and features. Make each option appealing to different visitor types.`,
    isActive: true
  },
  
  {
    name: 'tabbed-info',
    displayName: 'Tabbed Information',
    category: 'content',
    componentName: 'TabbedInfo',
    schema: {
      type: 'object',
      required: ['sectionTitle', 'sectionDescription', 'badgeText', 'tabs'],
      properties: {
        sectionTitle: { type: 'string' },
        sectionDescription: { type: 'string' },
        badgeText: { type: 'string' },
        tabs: {
          type: 'object',
          properties: {
            overview: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                highlights: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      value: { type: 'string' },
                      label: { type: 'string' }
                    }
                  }
                },
                whyChooseUs: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    reasons: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          description: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            essentialInfo: {
              type: 'object',
              properties: {
                knowBeforeYouGo: {
                  type: 'object',
                  properties: {
                    categories: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          items: { type: 'array', items: { type: 'string' } }
                        }
                      }
                    }
                  }
                },
                notAllowed: { type: 'array', items: { type: 'string' } },
                additionalInfo: { type: 'object' }
              }
            },
            planning: { type: 'object' },
            moreInfo: { type: 'object' }
          }
        },
        showcaseImagePrompts: {
          type: 'object',
          properties: {
            image1: { type: 'string' },
            image2: { type: 'string' },
            image3: { type: 'string' }
          }
        }
      }
    },
    defaultData: {
      badgeText: 'Everything You Need to Know',
      sectionTitle: 'Complete Experience Guide',
      sectionDescription: 'All the details to plan your perfect visit'
    },
    systemPrompt: `Create comprehensive information about the attraction organized into tabs: Overview, Essential Info, Planning, and More Info.`,
    userPromptTemplate: `Generate detailed tabbed information for {locationContext}. Cover overview with highlights and why to visit, essential visitor information, planning tips, and additional interesting facts. Be thorough and helpful.`,
    isActive: true
  },
  
  {
    name: 'reviews-carousel',
    displayName: 'Reviews Carousel',
    category: 'social-proof',
    componentName: 'ReviewsCarousel',
    schema: {
      type: 'object',
      required: ['sectionTitle', 'sectionDescription', 'badgeText', 'reviews'],
      properties: {
        sectionTitle: { type: 'string' },
        sectionDescription: { type: 'string' },
        badgeText: { type: 'string' },
        reviews: {
          type: 'array',
          minItems: 6,
          maxItems: 12,
          items: {
            type: 'object',
            required: ['author', 'country', 'date', 'rating', 'title', 'text'],
            properties: {
              author: { type: 'string' },
              country: { type: 'string' },
              date: { type: 'string' },
              rating: { type: 'number', minimum: 1, maximum: 5 },
              title: { type: 'string' },
              text: { type: 'string' }
            }
          }
        }
      }
    },
    defaultData: {
      badgeText: 'Customer Reviews',
      sectionTitle: 'What Our Guests Say',
      sectionDescription: 'Real experiences from travelers around the world'
    },
    systemPrompt: `Create authentic-sounding reviews from diverse international visitors. Include specific details and varied perspectives.`,
    userPromptTemplate: `Generate 8-10 realistic reviews for {locationContext} from visitors of different countries. Include specific details about their experiences, varied ratings (mostly 4-5 stars), and authentic visitor perspectives.`,
    isActive: true
  },
  
  {
    name: 'faq-accordion',
    displayName: 'FAQ Accordion',
    category: 'information',
    componentName: 'FAQAccordion',
    schema: {
      type: 'object',
      required: ['sectionTitle', 'sectionDescription', 'badgeText', 'faqs'],
      properties: {
        sectionTitle: { type: 'string' },
        sectionDescription: { type: 'string' },
        badgeText: { type: 'string' },
        faqs: {
          type: 'array',
          minItems: 5,
          maxItems: 10,
          items: {
            type: 'object',
            required: ['question', 'answer'],
            properties: {
              question: { type: 'string' },
              answer: { type: 'string' }
            }
          }
        }
      }
    },
    defaultData: {
      badgeText: 'FAQ',
      sectionTitle: 'Frequently Asked Questions',
      sectionDescription: 'Everything you need to know before your visit'
    },
    systemPrompt: `Create helpful FAQs that address common visitor concerns and questions about the attraction.`,
    userPromptTemplate: `Generate 6-8 frequently asked questions and detailed answers for {locationContext}. Cover topics like tickets, best time to visit, accessibility, what to bring, and practical tips.`,
    isActive: true
  },
  
  {
    name: 'final-cta',
    displayName: 'Final CTA',
    category: 'cta',
    componentName: 'FinalCTA',
    schema: {
      type: 'object',
      required: ['headline', 'description', 'ctaButton', 'trustIndicators'],
      properties: {
        headline: { type: 'string' },
        description: { type: 'string' },
        ctaButton: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            link: { type: 'string' }
          }
        },
        backgroundImagePrompt: { type: 'string' },
        trustIndicators: {
          type: 'object',
          properties: {
            averageRating: { type: 'string' },
            freeCancellation: { type: 'string' },
            support: { type: 'string' }
          }
        }
      }
    },
    defaultData: {
      ctaButton: {
        text: 'Book Your Experience Now',
        link: '#'
      },
      trustIndicators: {
        averageRating: '4.9/5 Average Rating',
        freeCancellation: 'Free Cancellation',
        support: '24/7 Support'
      }
    },
    systemPrompt: `Create a compelling final call-to-action that encourages visitors to book their experience.`,
    userPromptTemplate: `Generate a final CTA for {locationContext} with an exciting headline, motivating description, and optional atmospheric background image prompt.`,
    isActive: true
  }
];

async function main() {
  console.log('Starting seed...');
  
  // Upsert templates (create or update)
  for (const template of templates) {
    await prisma.template.upsert({
      where: { name: template.name },
      update: template,
      create: template
    });
    console.log(`Upserted template: ${template.name}`);
  }
  
  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });