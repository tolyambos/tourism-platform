# Gemini Content Generation Structure Guide

This document outlines the exact JSON structure that Gemini should generate for each section of the tourism website. Each section has specific fields that must be populated.

## 1. AttractionHero Section

Generate content with this exact structure:

```json
{
  "mainHeadline": "Prague Zoo Tickets - Skip the Line & Save 20%",
  "subHeadline": "Explore one of Europe's top-rated zoos with over 5,000 animals from 650 species",
  "price": "25",
  "currency": "€",
  "keyFeatures": [
    "Skip-the-line entry",
    "Valid for 1 day",
    "Free for children under 3",
    "Wheelchair accessible"
  ],
  "backgroundImage": "https://example.com/prague-zoo-hero.jpg",
  "backgroundImagePrompt": "Beautiful panoramic view of Prague Zoo with giraffes and elephants visible, lush greenery, sunny day",
  "availableBadge": "Available Today",
  "ctaButtons": {
    "primary": {
      "text": "See Tickets & Prices",
      "link": "#featured-experiences"
    },
    "secondary": {
      "text": "Buy Tickets",
      "link": "https://affiliate-link.com"
    }
  },
  "disclaimer": "This is not an official website. All content is for informational purposes only. We may earn commission from bookings."
}
```

**Field Requirements:**
- `mainHeadline`: 50-70 characters, include location and key benefit
- `subHeadline`: 80-120 characters, expand on the main value proposition
- `price`: Lowest available price as number only
- `currency`: Currency symbol (€, $, £, etc.)
- `keyFeatures`: Array of 3-5 key selling points (each 20-30 characters)
- `backgroundImage`: High-quality image URL (1920x1080 minimum)
- `backgroundImagePrompt`: Detailed description for AI image generation
- `availableBadge`: Short availability status
- `disclaimer`: Legal disclaimer about affiliate status

## 2. QuickInfoBar Section

```json
{
  "duration": "Full day (8-10 hours)",
  "languages": ["English", "German", "Spanish", "French", "Italian"],
  "groupSize": "Up to 30 people",
  "features": ["Free Cancellation", "Mobile Tickets", "Instant Confirmation"]
}
```

**Field Requirements:**
- `duration`: Typical visit/tour duration
- `languages`: Array of available languages (guides/audio)
- `groupSize`: Maximum group size or flexibility
- `features`: Array of 2-4 key features/benefits

## 3. ProductCards Section

```json
{
  "sectionTitle": "Popular Tours & Activities",
  "sectionDescription": "Hand-picked experiences for unforgettable memories",
  "badgeText": "Featured Experiences",
  "featuredWidget": {
    "enabled": true,
    "title": "Recommended Experience",
    "tourId": "189477"
  },
  "productCards": [
    {
      "name": "Prague Zoo Skip-the-Line Ticket",
      "description": "Enjoy hassle-free entry to one of the world's best zoos. See rare animals including Przewalski's horses and giant tortoises.",
      "rating": 4.7,
      "reviewCount": 2341,
      "price": "25",
      "oldPrice": "30",
      "currency": "€",
      "priceType": "per_person",
      "startsFrom": true,
      "duration": "Full day",
      "images": [
        "https://example.com/prague-zoo-1.jpg",
        "https://example.com/prague-zoo-2.jpg",
        "https://example.com/prague-zoo-3.jpg"
      ],
      "badges": ["Bestseller"],
      "features": {
        "freeCancellation": true,
        "instantConfirmation": true,
        "hotelPickup": false
      },
      "highlights": [
        "Skip the ticket lines",
        "See over 5,000 animals",
        "Visit the Indonesian Jungle pavilion",
        "Watch daily feeding sessions"
      ],
      "directUrl": "https://www.getyourguide.com/prague-l10/prague-zoo-ticket-t123456/",
      "affiliateUrl": "https://affiliate.link/prague-zoo"
    }
  ]
}
```

**Field Requirements:**
- `productCards`: Array of 3-6 product/tour options
- `rating`: Number between 4.0-5.0
- `reviewCount`: Realistic review count
- `price/oldPrice`: Numbers only, no currency symbols
- `images`: Array of 3-5 high-quality images per product
- `highlights`: Array of 3-5 key highlights per product

## 4. TabbedInfo Section

```json
{
  "sectionTitle": "Complete Experience Guide",
  "sectionDescription": "All the details you need in one place",
  "badgeText": "Everything You Need to Know",
  "tabs": {
    "overview": {
      "title": "Overview",
      "content": "Prague Zoo is one of the world's best zoos, home to over 5,000 animals...",
      "highlights": [
        "4th best zoo in the world",
        "58 hectares of natural habitats",
        "Conservation leader for endangered species"
      ],
      "whyChooseUs": {
        "title": "Why Visit Prague Zoo",
        "reasons": [
          {
            "title": "World-Class Exhibits",
            "description": "See unique pavilions like the Indonesian Jungle and Elephant Valley"
          },
          {
            "title": "Conservation Success",
            "description": "Home to successful breeding programs for endangered species"
          }
        ]
      }
    },
    "essentialInfo": {
      "knowBeforeYouGo": {
        "categories": [
          {
            "title": "Opening Hours",
            "items": [
              "April-October: 9:00 AM - 7:00 PM",
              "November-March: 9:00 AM - 4:00 PM",
              "Last entry 30 minutes before closing"
            ]
          },
          {
            "title": "Getting There",
            "items": [
              "Take bus 112 from Nádraží Holešovice metro station",
              "Journey takes approximately 15 minutes",
              "Zoo entrance is a short walk from the bus stop"
            ]
          }
        ]
      },
      "notAllowed": [
        "Feeding animals",
        "Flash photography in some exhibits",
        "Drones or professional filming equipment",
        "Pets (except service animals)"
      ],
      "additionalInfo": {
        "accessibilityInfo": "Wheelchair accessible with ramps and elevators available",
        "ageRestrictions": "Free entry for children under 3 years",
        "weatherInfo": "Open in all weather conditions; some indoor exhibits available",
        "languageSupport": "Maps available in 10 languages"
      }
    },
    "planning": {
      "bookingTips": [
        "Book online to save 10-20% on ticket prices",
        "Weekdays are less crowded than weekends",
        "Arrive early to see morning feeding sessions"
      ],
      "whatToBring": [
        "Comfortable walking shoes",
        "Weather-appropriate clothing",
        "Camera for photos",
        "Water bottle (refill stations available)"
      ],
      "bestSeasonsToVisit": "Spring (April-May) and early fall (September) offer pleasant weather and active animals",
      "clothingRecommendations": "Dress in layers; zoo involves extensive outdoor walking"
    },
    "moreInfo": {
      "historicalContext": "Founded in 1931, Prague Zoo has grown from 8 hectares to 58 hectares...",
      "photographyTips": [
        "Best photo spots: Elephant Valley overlook, Indonesian Jungle bridge",
        "Early morning provides best lighting",
        "Bring zoom lens for animal close-ups"
      ],
      "insiderTips": [
        "Download the zoo app for interactive maps and feeding times",
        "The chairlift offers stunning views of Prague",
        "Restaurant U Lva serves traditional Czech cuisine"
      ],
      "funFacts": [
        "Home to the only giant tortoises in Czech Republic",
        "Successfully bred the first Przewalski's horse in captivity",
        "The zoo's salamander exhibit is the largest in Europe"
      ],
      "cancellationPolicy": "Free cancellation up to 24 hours before your visit",
      "socialMediaHashtags": ["#PragueZoo", "#ZooPraha", "#CzechZoo"]
    }
  },
  "showcaseImages": {
    "image1": "https://example.com/zoo-overview.jpg",
    "image2": "https://example.com/zoo-elephants.jpg",
    "image3": "https://example.com/zoo-pavilion.jpg",
    "image4": "https://example.com/zoo-sunset.jpg"
  }
}
```

## 5. ReviewsCarousel Section

```json
{
  "sectionTitle": "What Our Guests Say",
  "sectionDescription": "Real experiences from real visitors",
  "badgeText": "Customer Reviews",
  "reviews": [
    {
      "author": "Sarah Mitchell",
      "country": "United Kingdom",
      "date": "October 2024",
      "rating": 5,
      "title": "Absolutely amazing zoo!",
      "text": "One of the best zoos I've ever visited. The animals look happy and well-cared for, and the enclosures are spacious and natural. The Indonesian Jungle pavilion was incredible!"
    },
    {
      "author": "Thomas Weber",
      "country": "Germany",
      "date": "September 2024",
      "rating": 5,
      "title": "Perfect family day out",
      "text": "Spent the whole day here with my kids. They loved the playground areas and feeding times. The chairlift was a highlight - beautiful views of Prague!"
    }
  ]
}
```

**Field Requirements:**
- Generate 8-12 diverse, realistic reviews
- Mix of 4 and 5-star ratings (mostly 5-star)
- Vary review lengths (50-150 words)
- Include specific details about the experience
- Use diverse international names and countries

## 6. FAQAccordion Section

```json
{
  "sectionTitle": "Frequently Asked Questions",
  "sectionDescription": "Everything you need to know before your visit",
  "badgeText": "FAQ",
  "faqs": [
    {
      "question": "How long does it take to see the entire zoo?",
      "answer": "Most visitors spend 4-6 hours at Prague Zoo. To see everything comfortably, including shows and feeding times, plan for a full day (6-8 hours). The zoo is quite large at 58 hectares, so comfortable shoes are essential."
    },
    {
      "question": "Is Prague Zoo suitable for young children?",
      "answer": "Yes! Prague Zoo is very family-friendly with playgrounds, children's zoo, and stroller-accessible paths. Children under 3 enter free. There are baby changing facilities and restaurants with kids' menus throughout the zoo."
    }
  ]
}
```

**Field Requirements:**
- Generate 6-10 relevant FAQs
- Questions should be practical and specific
- Answers should be detailed (50-100 words)
- Cover topics: tickets, timing, facilities, accessibility, transport

## 7. FinalCTA Section

```json
{
  "headline": "Ready for an Unforgettable Day at Prague Zoo?",
  "description": "Join thousands of visitors who've experienced one of Europe's top-rated zoos",
  "ctaButton": {
    "text": "Book Your Zoo Adventure",
    "link": "https://affiliate-link.com"
  },
  "backgroundImage": "https://example.com/zoo-final-cta.jpg",
  "backgroundImagePrompt": "Sunset view over Prague Zoo with silhouettes of giraffes and the Prague skyline in background",
  "trustIndicators": {
    "averageRating": "4.7/5 Average Rating",
    "freeCancellation": "Free Cancellation",
    "support": "24/7 Support"
  }
}
```

## Important Notes for Gemini:

1. **Consistency**: Ensure all prices, ratings, and key information are consistent across sections
2. **Localization**: Adapt content to the target location and audience
3. **SEO**: Include location names and key search terms naturally in headlines and descriptions
4. **Authenticity**: Reviews should sound genuine and varied, not templated
5. **Completeness**: Every field must be populated - no null or empty values
6. **URLs**: Use placeholder URLs (https://example.com/) for images and real affiliate URLs where provided

## Example Prompt for Gemini:

"Generate complete JSON content for all 7 sections of a tourism website page about [ATTRACTION NAME] in [LOCATION]. Follow the exact structure provided in the documentation, ensuring all fields are populated with relevant, engaging, and SEO-optimized content. Make the content compelling and conversion-focused while maintaining authenticity."