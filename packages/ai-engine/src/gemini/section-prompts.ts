// Export Type enum that matches the @google/genai format
export enum Type {
  OBJECT = 'object',
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array'
}

// ============================================
// 1. ATTRACTION HERO SECTION
// ============================================

export const attractionHeroPrompt = {
  systemInstruction: `You are an expert tourism content creator specializing in compelling, conversion-focused copy for tourist attractions and experiences. Generate content that is engaging, informative, and optimized for search engines while maintaining authenticity.`,
  
  userPrompt: (attraction: string, location: string) => `Generate compelling hero section content for ${attraction} in ${location}. Create a captivating main headline (50-70 chars), engaging subheadline (80-120 chars), and identify key features that would appeal to tourists. Include pricing information and create appropriate call-to-action buttons. The content should highlight what makes this attraction special and why visitors should book tickets.`,
  
  responseSchema: {
    type: "object",
    required: [
      "mainHeadline",
      "subHeadline", 
      "price",
      "currency",
      "keyFeatures",
      "backgroundImagePrompt",
      "availableBadge",
      "ctaButtons",
      "disclaimer"
    ],
    properties: {
      mainHeadline: {
        type: "string",
        description: "50-70 characters, include location and key benefit"
      },
      subHeadline: {
        type: "string",
        description: "80-120 characters, expand on main value proposition"
      },
      price: {
        type: "string",
        description: "Lowest available price as number only"
      },
      currency: {
        type: "string",
        description: "Currency symbol (€, $, £, etc.)"
      },
      keyFeatures: {
        type: "array",
        items: {
          type: "string",
          description: "20-30 characters each"
        },
        description: "3-5 key selling points"
      },
      backgroundImagePrompt: {
        type: "string",
        description: "Detailed description for AI image generation"
      },
      availableBadge: {
        type: "string",
        description: "Short availability status"
      },
      ctaButtons: {
        type: "object",
        required: ["primary", "secondary"],
        properties: {
          primary: {
            type: "object",
            required: ["text", "link"],
            properties: {
              text: {
                type: "string"
              },
              link: {
                type: "string"
              }
            }
          },
          secondary: {
            type: "object",
            required: ["text", "link"],
            properties: {
              text: {
                type: "string"
              },
              link: {
                type: "string"
              }
            }
          }
        }
      },
      disclaimer: {
        type: "string",
        description: "Legal disclaimer about affiliate status"
      }
    }
  }
};

// ============================================
// 2. QUICK INFO BAR SECTION
// ============================================

export const quickInfoBarPrompt = {
  systemInstruction: `You are an expert in tourist attraction information. Provide accurate, concise details about visit duration, available languages, group sizes, and key features.`,
  
  userPrompt: (attraction: string, location: string) => `Generate quick info bar content for ${attraction} in ${location}. Include typical visit duration, available languages for tours/guides/audio, maximum group size, and 2-4 key features or benefits that visitors should know about.`,
  
  responseSchema: {
    type: "object",
    required: ["duration", "languages", "groupSize", "features"],
    properties: {
      duration: {
        type: "string",
        description: "Typical visit/tour duration"
      },
      languages: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Available languages for guides/audio"
      },
      groupSize: {
        type: "string",
        description: "Maximum group size or flexibility"
      },
      features: {
        type: "array",
        items: {
          type: "string"
        },
        description: "2-4 key features/benefits"
      }
    }
  }
};

// ============================================
// 3. PRODUCT CARDS SECTION
// ============================================

export const productCardsPrompt = {
  systemInstruction: `You are a tourism product specialist. Create detailed, appealing product cards for tours and tickets. Each product should have unique selling points, realistic pricing, and compelling descriptions that drive conversions.`,
  
  userPrompt: (attraction: string, location: string) => `Generate 3-5 different ticket/tour options for ${attraction} in ${location}. Include varied price points and tour types (standard entry, skip-the-line, guided tours, combo tickets, etc.). For each product, create compelling descriptions, realistic ratings (4.0-5.0), and highlight unique features. Make each option distinct and appealing to different visitor needs.`,
  
  responseSchema: {
    type: "object",
    required: ["sectionTitle", "sectionDescription", "badgeText", "productCards"],
    properties: {
      sectionTitle: {
        type: "string"
      },
      sectionDescription: {
        type: "string"
      },
      badgeText: {
        type: "string"
      },
      featuredWidget: {
        type: "object",
        properties: {
          enabled: {
            type: "boolean"
          },
          title: {
            type: "string"
          },
          tourId: {
            type: "string"
          }
        }
      },
      productCards: {
        type: "array",
        items: {
          type: "object",
          required: [
            "name",
            "description",
            "rating",
            "reviewCount",
            "price",
            "currency",
            "duration",
            "features",
            "highlights"
          ],
          properties: {
            name: {
              type: "string"
            },
            description: {
              type: "string"
            },
            rating: {
              type: "number"
            },
            reviewCount: {
              type: "number"
            },
            price: {
              type: "string"
            },
            oldPrice: {
              type: "string"
            },
            currency: {
              type: "string"
            },
            priceType: {
              type: "string",
              enum: ["per_person", "per_group", "per_vehicle"]
            },
            startsFrom: {
              type: "boolean"
            },
            duration: {
              type: "string"
            },
            badges: {
              type: "array",
              items: {
                type: "string"
              }
            },
            features: {
              type: "object",
              properties: {
                freeCancellation: {
                  type: "boolean"
                },
                instantConfirmation: {
                  type: "boolean"
                },
                hotelPickup: {
                  type: "boolean"
                }
              }
            },
            highlights: {
              type: "array",
              items: {
                type: "string"
              }
            }
          }
        }
      }
    }
  }
};

// ============================================
// 4. TABBED INFO SECTION
// ============================================

export const tabbedInfoPrompt = {
  systemInstruction: `You are a comprehensive travel guide writer. Create detailed, well-organized information about tourist attractions covering all aspects visitors need to know. Write in an engaging, informative style that helps visitors plan their visit effectively.`,
  
  userPrompt: (attraction: string, location: string) => `Generate comprehensive tabbed information content for ${attraction} in ${location}. Include:
  
  1. Overview: General description, why it's special, key highlights
  2. Essential Info: Opening hours, how to get there, what's not allowed, accessibility
  3. Planning: Booking tips, what to bring, best times to visit, dress code
  4. More Info: Historical context, photography tips, insider tips, fun facts
  
  Make the content thorough, practical, and engaging. Include specific details that would be genuinely helpful for visitors.`,
  
  responseSchema: {
    type: "object",
    required: ["sectionTitle", "sectionDescription", "badgeText", "tabs"],
    properties: {
      sectionTitle: {
        type: "string"
      },
      sectionDescription: {
        type: "string"
      },
      badgeText: {
        type: "string"
      },
      tabs: {
        type: "object",
        required: ["overview", "essentialInfo", "planning", "moreInfo"],
        properties: {
          overview: {
            type: "object",
            required: ["title", "content", "highlights", "whyChooseUs"],
            properties: {
              title: {
                type: "string"
              },
              content: {
                type: "string"
              },
              highlights: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              whyChooseUs: {
                type: "object",
                required: ["title", "reasons"],
                properties: {
                  title: {
                    type: "string"
                  },
                  reasons: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["title", "description"],
                      properties: {
                        title: {
                          type: "string"
                        },
                        description: {
                          type: "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          essentialInfo: {
            type: "object",
            required: ["knowBeforeYouGo", "notAllowed", "additionalInfo"],
            properties: {
              knowBeforeYouGo: {
                type: "object",
                required: ["categories"],
                properties: {
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["title", "items"],
                      properties: {
                        title: {
                          type: "string"
                        },
                        items: {
                          type: "array",
                          items: {
                            type: "string"
                          }
                        }
                      }
                    }
                  }
                }
              },
              notAllowed: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              additionalInfo: {
                type: "object",
                properties: {
                  accessibilityInfo: {
                    type: "string"
                  },
                  ageRestrictions: {
                    type: "string"
                  },
                  weatherInfo: {
                    type: "string"
                  },
                  languageSupport: {
                    type: "string"
                  }
                }
              }
            }
          },
          planning: {
            type: "object",
            required: ["bookingTips", "whatToBring", "bestSeasonsToVisit", "clothingRecommendations"],
            properties: {
              bookingTips: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              whatToBring: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              bestSeasonsToVisit: {
                type: "string"
              },
              clothingRecommendations: {
                type: "string"
              }
            }
          },
          moreInfo: {
            type: "object",
            required: [
              "historicalContext",
              "photographyTips",
              "insiderTips",
              "funFacts",
              "cancellationPolicy",
              "socialMediaHashtags"
            ],
            properties: {
              historicalContext: {
                type: "string"
              },
              photographyTips: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              insiderTips: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              funFacts: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              cancellationPolicy: {
                type: "string"
              },
              socialMediaHashtags: {
                type: "array",
                items: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    }
  }
};

// ============================================
// 5. REVIEWS CAROUSEL SECTION
// ============================================

export const reviewsCarouselPrompt = {
  systemInstruction: `You are a review generation specialist. Create authentic, diverse customer reviews that sound genuine and help build trust. Reviews should be specific, mention real aspects of the experience, and vary in writing style and length.`,
  
  userPrompt: (attraction: string, location: string) => `Generate 10-12 authentic customer reviews for ${attraction} in ${location}. Reviews should:
  - Sound like real people from different countries
  - Mention specific aspects of the experience
  - Be mostly positive (4-5 stars) with 1-2 constructive 4-star reviews
  - Vary in length (50-150 words)
  - Include recent dates (within last 6 months)
  - Reference actual features, exhibits, or experiences`,
  
  responseSchema: {
    type: "object",
    required: ["sectionTitle", "sectionDescription", "badgeText", "reviews"],
    properties: {
      sectionTitle: {
        type: "string"
      },
      sectionDescription: {
        type: "string"
      },
      badgeText: {
        type: "string"
      },
      reviews: {
        type: "array",
        items: {
          type: "object",
          required: ["author", "country", "date", "rating", "title", "text"],
          properties: {
            author: {
              type: "string"
            },
            country: {
              type: "string"
            },
            date: {
              type: "string"
            },
            rating: {
              type: "number"
            },
            title: {
              type: "string"
            },
            text: {
              type: "string"
            }
          }
        }
      }
    }
  }
};

// ============================================
// 6. FAQ ACCORDION SECTION
// ============================================

export const faqAccordionPrompt = {
  systemInstruction: `You are a customer service expert for tourist attractions. Create helpful, detailed FAQ content that addresses real visitor concerns and questions. Answers should be informative, practical, and build confidence in booking.`,
  
  userPrompt: (attraction: string, location: string) => `Generate 8-10 frequently asked questions and detailed answers for ${attraction} in ${location}. Cover topics like:
  - Tickets and pricing
  - Visit duration and best times
  - Transportation and parking
  - Facilities and amenities
  - Accessibility
  - Food and drinks
  - Children and families
  - Weather considerations
  
  Make answers specific and helpful (50-100 words each).`,
  
  responseSchema: {
    type: "object",
    required: ["sectionTitle", "sectionDescription", "badgeText", "faqs"],
    properties: {
      sectionTitle: {
        type: "string"
      },
      sectionDescription: {
        type: "string"
      },
      badgeText: {
        type: "string"
      },
      faqs: {
        type: "array",
        items: {
          type: "object",
          required: ["question", "answer"],
          properties: {
            question: {
              type: "string"
            },
            answer: {
              type: "string"
            }
          }
        }
      }
    }
  }
};

// ============================================
// 7. FINAL CTA SECTION
// ============================================

export const finalCTAPrompt = {
  systemInstruction: `You are a conversion optimization specialist. Create compelling final call-to-action content that motivates visitors to book their tickets. Use persuasive but authentic language that creates urgency without being pushy.`,
  
  userPrompt: (attraction: string, location: string) => `Generate a compelling final call-to-action for ${attraction} in ${location}. Create an inspiring headline that encourages booking, a supportive description that reinforces the value, and trust indicators that build confidence.`,
  
  responseSchema: {
    type: "object",
    required: [
      "headline",
      "description",
      "ctaButton",
      "backgroundImagePrompt",
      "trustIndicators"
    ],
    properties: {
      headline: {
        type: "string"
      },
      description: {
        type: "string"
      },
      ctaButton: {
        type: "object",
        required: ["text", "link"],
        properties: {
          text: {
            type: "string"
          },
          link: {
            type: "string"
          }
        }
      },
      backgroundImagePrompt: {
        type: "string",
        description: "Description for final CTA background image"
      },
      trustIndicators: {
        type: "object",
        required: ["averageRating", "freeCancellation", "support"],
        properties: {
          averageRating: {
            type: "string"
          },
          freeCancellation: {
            type: "string"
          },
          support: {
            type: "string"
          }
        }
      }
    }
  }
};

// ============================================
// HELPER FUNCTION TO GENERATE CONTENT
// ============================================

export async function generateSectionContent(
  sectionType: string,
  attraction: string,
  location: string,
  geminiClient: any
) {
  const prompts = {
    attractionHero: attractionHeroPrompt,
    quickInfoBar: quickInfoBarPrompt,
    productCards: productCardsPrompt,
    tabbedInfo: tabbedInfoPrompt,
    reviewsCarousel: reviewsCarouselPrompt,
    faqAccordion: faqAccordionPrompt,
    finalCTA: finalCTAPrompt
  };

  const promptConfig = prompts[sectionType as keyof typeof prompts];
  if (!promptConfig) {
    throw new Error(`Unknown section type: ${sectionType}`);
  }

  const config = {
    responseMimeType: 'application/json',
    responseSchema: promptConfig.responseSchema,
    systemInstruction: [
      {
        text: promptConfig.systemInstruction
      }
    ]
  };

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: promptConfig.userPrompt(attraction, location)
        }
      ]
    }
  ];

  const response = await geminiClient.models.generateContent({
    model: 'gemini-2.5-pro',
    config,
    contents
  });

  return JSON.parse(response.text);
}

// ============================================
// GENERATE ALL SECTIONS AT ONCE
// ============================================

export async function generateAllSections(
  attraction: string,
  location: string,
  geminiClient: any
) {
  const sections = [
    'attractionHero',
    'quickInfoBar',
    'productCards',
    'tabbedInfo',
    'reviewsCarousel',
    'faqAccordion',
    'finalCTA'
  ];

  const results: Record<string, any> = {};

  for (const section of sections) {
    try {
      results[section] = await generateSectionContent(
        section,
        attraction,
        location,
        geminiClient
      );
    } catch (error) {
      console.error(`Error generating ${section}:`, error);
      results[section] = null;
    }
  }

  return results;
}