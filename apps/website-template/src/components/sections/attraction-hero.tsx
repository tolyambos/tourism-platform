'use client';

import Image from 'next/image';
import Link from 'next/link';

interface AttractionHeroProps {
  content: {
    mainHeadline: string;
    subHeadline: string;
    price: string;
    currency: string;
    keyFeatures: string[];
    backgroundImage: string;
    backgroundImagePrompt?: string;
    availableBadge: string;
    ctaButtons: {
      primary: {
        text: string;
        link: string;
      };
      secondary: {
        text: string;
        link: string;
      };
    };
    disclaimer: string;
  };
}

export default function AttractionHero({ content = {} }: { content?: any }) {
  // Provide default values for missing content
  const safeContent = {
    mainHeadline: content?.mainHeadline || 'Welcome',
    subHeadline: content?.subHeadline || '',
    price: content?.price || '0',
    currency: content?.currency || '$',
    keyFeatures: content?.keyFeatures || [],
    backgroundImage: content?.backgroundImage || '',
    availableBadge: content?.availableBadge || 'Available Now',
    ctaButtons: {
      primary: {
        text: content?.ctaButtons?.primary?.text || 'Book Now',
        link: content?.ctaButtons?.primary?.link || '#'
      },
      secondary: {
        text: content?.ctaButtons?.secondary?.text || 'Learn More',
        link: content?.ctaButtons?.secondary?.link || '#'
      }
    },
    disclaimer: content?.disclaimer || ''
  };

  return (
    <section className="relative pt-16 h-[calc(30vh+4rem)] min-h-[200px] md:h-[calc(70vh+4rem)] md:min-h-[664px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 top-16 w-full h-full">
        {safeContent.backgroundImage ? (
          <Image
            src={safeContent.backgroundImage}
            alt={safeContent.mainHeadline}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700" />
        )}
      </div>
      <div className="absolute inset-0 top-16 bg-gradient-to-b from-black/60 to-black/80" />

      <div className="relative z-10 px-4 mx-auto max-w-4xl text-center md:px-6">
        {/* Available Badge - Hidden on mobile */}
        <span className="hidden items-center px-3 py-1.5 mb-6 text-sm font-medium text-white rounded-full backdrop-blur-sm md:inline-flex bg-white/20">
          <span className="mr-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          {safeContent.availableBadge}
        </span>

        <h1 className="mb-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl md:mb-4 lg:text-5xl xl:text-6xl">
          {safeContent.mainHeadline}
        </h1>
        
        <p className="mx-auto mb-4 max-w-2xl text-xs text-white/90 md:text-lg md:mb-8 lg:text-xl">
          {safeContent.subHeadline}
        </p>

        {/* CTA Buttons - Hidden on mobile */}
        <div className="hidden flex-col gap-3 justify-center md:flex sm:flex-row md:gap-4">
          <Link 
            href={safeContent.ctaButtons.primary.link}
            className="px-6 py-2.5 text-sm font-semibold text-gray-900 bg-white rounded-full transition-all duration-300 transform sm:text-base md:px-8 md:py-3 hover:shadow-xl hover:-translate-y-1"
          >
            {safeContent.ctaButtons.primary.text} • 
            <span className="ml-1">From {safeContent.currency}{safeContent.price}</span>
          </Link>
          
          <a 
            href={safeContent.ctaButtons.secondary.link} 
            target="_blank" 
            rel="nofollow noopener" 
            className="relative overflow-hidden px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300 transform sm:text-base md:px-8 md:py-3 hover:shadow-xl hover:-translate-y-1 hover:from-orange-600 hover:to-red-600"
          >
            <span className="relative z-10">{safeContent.ctaButtons.secondary.text}</span>
            <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 opacity-0 transition-opacity duration-300 hover:opacity-100" />
          </a>
        </div>

        {/* Key Features - Desktop only */}
        {safeContent.keyFeatures.length > 0 && (
          <div className="hidden flex-wrap gap-3 justify-center mt-8 md:flex">
            {safeContent.keyFeatures.map((feature: string, index: number) => (
              <span key={index} className="px-4 py-1.5 text-sm text-white rounded-full border backdrop-blur-sm bg-white/10 border-white/20">
                {feature}
              </span>
            ))}
          </div>
        )}
        
        {/* Disclaimer - Always visible */}
        {safeContent.disclaimer && (
          <div className="mt-8 md:mt-12">
            <div className="mx-auto max-w-2xl">
              <div className="px-4 py-3 text-center text-white bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 md:px-6 md:py-4">
                <p className="text-xs md:text-sm font-medium">
                  <strong>Disclaimer:</strong> {safeContent.disclaimer}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}