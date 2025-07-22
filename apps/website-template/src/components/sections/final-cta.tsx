'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

interface FinalCTAProps {
  content: {
    headline: string;
    description: string;
    ctaButton: {
      text: string;
      link: string;
    };
    backgroundImage?: string;
    backgroundImagePrompt?: string;
    trustIndicators: {
      averageRating: string;
      freeCancellation: string;
      support: string;
    };
  };
}

export default function FinalCTA({ content = {} }: { content?: any }) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  // Provide safe defaults
  const safeContent = {
    headline: content?.headline || 'Ready to Start Your Journey?',
    description: content?.description || 'Book your experience today and create unforgettable memories.',
    ctaButton: {
      text: content?.ctaButton?.text || 'Book Now',
      link: content?.ctaButton?.link || '#'
    },
    backgroundImage: content?.backgroundImage,
    trustIndicators: {
      averageRating: content?.trustIndicators?.averageRating || '4.8/5 Average Rating',
      freeCancellation: content?.trustIndicators?.freeCancellation || 'Free Cancellation',
      support: content?.trustIndicators?.support || '24/7 Support'
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current || !safeContent.backgroundImage) return;
      
      const scrolled = window.pageYOffset;
      const parallax = parallaxRef.current;
      const speed = 0.5;
      
      parallax.style.transform = `translateY(${scrolled * speed}px)`;
    };

    if (safeContent.backgroundImage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [safeContent.backgroundImage]);

  return (
    <section className={`relative py-8 md:py-20 ${safeContent.backgroundImage ? 'overflow-hidden' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
      {safeContent.backgroundImage && (
        <>
          <div ref={parallaxRef} className="absolute inset-0 w-full h-[125%] -top-[12.5%]">
            <Image
              src={safeContent.backgroundImage}
              alt="Experience"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
        </>
      )}
      
      <div className={`${safeContent.backgroundImage ? 'relative z-10' : ''} px-4 mx-auto max-w-4xl text-center sm:px-6 lg:px-8`}>
        <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl">{safeContent.headline}</h2>
        <p className="mb-8 text-xl text-white/90">{safeContent.description}</p>
        
        <a 
          href={safeContent.ctaButton.link} 
          target="_blank" 
          rel="nofollow noopener" 
          className="inline-flex items-center px-8 py-3 font-bold text-blue-600 bg-white rounded-full transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1"
        >
          {safeContent.ctaButton.text}
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>

        {/* Trust Indicators */}
        <div className={`flex flex-wrap gap-6 justify-center mt-10 ${safeContent.backgroundImage ? 'text-white/80' : 'text-white/90'}`}>
          <div className="flex gap-2 items-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span>{safeContent.trustIndicators.averageRating}</span>
          </div>
          <div className="flex gap-2 items-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span>{safeContent.trustIndicators.freeCancellation}</span>
          </div>
          <div className="flex gap-2 items-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <span>{safeContent.trustIndicators.support}</span>
          </div>
        </div>
      </div>
    </section>
  );
}