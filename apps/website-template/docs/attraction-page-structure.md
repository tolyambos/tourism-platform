# Attraction Page Structure

This document defines the exact section order and component structure for attraction pages based on the optimized HTML template.

## Section Order

The following sections should be included in this exact order when creating an attraction page:

### 1. AttractionHero
- **Component**: `AttractionHero`
- **Template Name**: `attraction-hero`
- **Purpose**: Hero section with dramatic background image
- **Key Elements**:
  - Background image with overlay
  - Available today badge (hidden on mobile)
  - Main headline (H1)
  - Subheadline
  - CTA buttons (hidden on mobile)
  - Key features badges (desktop only)
  - Disclaimer notice

### 2. QuickInfoBar
- **Component**: `QuickInfoBar`
- **Template Name**: `quick-info-bar`
- **Purpose**: Display key information at a glance
- **Key Elements**:
  - Duration
  - Languages count
  - Group size
  - Additional features (e.g., "Free Cancellation")

### 3. ProductCards
- **Component**: `ProductCards`
- **Template Name**: `product-cards`
- **Purpose**: Featured experiences and tour options
- **Key Elements**:
  - Section badge and title
  - Featured widget (optional GetYourGuide integration)
  - Product cards with:
    - Image carousel
    - Rating and reviews
    - Price (with old price if discounted)
    - Description
    - Service features
    - View details button
    - Book now button

### 4. TabbedInfo
- **Component**: `TabbedInfo`
- **Template Name**: `tabbed-info`
- **Purpose**: Comprehensive information organized in tabs
- **Tabs**:
  1. **Overview**:
     - Quick overview with optional background
     - Why choose us section
     - Experience highlights
  2. **Essential Info**:
     - Know before you go
     - Not allowed items
     - Additional info grid (accessibility, age, weather, etc.)
  3. **Planning**:
     - Booking tips
     - What to bring
     - Best seasons
     - What to wear
  4. **More Info**:
     - Historical context
     - Photography tips
     - Insider tips
     - Fun facts
     - Cancellation policy

### 5. ReviewsCarousel
- **Component**: `ReviewsCarousel`
- **Template Name**: `reviews-carousel`
- **Purpose**: Display customer reviews
- **Key Elements**:
  - Review cards with author, rating, title, and text
  - Carousel navigation (responsive: 1 on mobile, 2 on tablet, 3 on desktop)
  - Dot indicators

### 6. FAQ
- **Component**: `FAQAccordion`
- **Template Name**: `faq-accordion`
- **Purpose**: Frequently asked questions
- **Key Elements**:
  - Expandable accordion items
  - Clean, minimal design

### 7. FinalCTA
- **Component**: `FinalCTA`
- **Template Name**: `final-cta`
- **Purpose**: Final call-to-action section
- **Key Elements**:
  - Optional parallax background image
  - Compelling headline
  - Book now button
  - Trust indicators (rating, free cancellation, 24/7 support)

## Implementation Notes

1. **Responsive Design**: All sections are fully responsive with specific mobile optimizations
2. **Image Optimization**: Use Next.js Image component with proper sizes and lazy loading
3. **Internationalization**: All text content should support multiple languages
4. **SEO**: Ensure proper heading hierarchy and meta tags
5. **Performance**: Implement lazy loading for images and non-critical sections

## Component Props Structure

Each section component expects a `content` prop with the appropriate data structure. See individual component files for detailed prop types.

## Example Page Configuration

```typescript
const attractionPage = {
  sections: [
    { template: 'attraction-hero', order: 1 },
    { template: 'quick-info-bar', order: 2 },
    { template: 'product-cards', order: 3 },
    { template: 'tabbed-info', order: 4 },
    { template: 'reviews-carousel', order: 5 },
    { template: 'faq-accordion', order: 6 },
    { template: 'final-cta', order: 7 }
  ]
};
```