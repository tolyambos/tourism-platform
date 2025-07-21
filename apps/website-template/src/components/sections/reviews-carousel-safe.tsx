'use client';

import { useState, useEffect } from 'react';
import { getDefaultReviewsContent, mergeWithDefaults } from './safe-wrappers';

interface ReviewsCarouselProps {
  content?: any;
}

export default function ReviewsCarousel({ content }: ReviewsCarouselProps) {
  const safeContent = mergeWithDefaults(getDefaultReviewsContent(), content);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewsPerView, setReviewsPerView] = useState(1);

  const reviews = safeContent.reviews || [];
  const totalReviews = reviews.length;

  useEffect(() => {
    const updateReviewsPerView = () => {
      if (window.innerWidth >= 1024) {
        setReviewsPerView(3);
      } else if (window.innerWidth >= 640) {
        setReviewsPerView(2);
      } else {
        setReviewsPerView(1);
      }
    };

    updateReviewsPerView();
    window.addEventListener('resize', updateReviewsPerView);
    return () => window.removeEventListener('resize', updateReviewsPerView);
  }, []);

  const nextReview = () => {
    if (currentIndex + reviewsPerView < totalReviews) {
      setCurrentIndex(currentIndex + reviewsPerView);
    }
  };

  const prevReview = () => {
    if (currentIndex > 0) {
      setCurrentIndex(Math.max(0, currentIndex - reviewsPerView));
    }
  };

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="py-4 bg-white md:py-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-6 text-center md:mb-12">
            <span className="inline-block px-4 py-1 mb-4 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-full">
              {safeContent.badgeText}
            </span>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{safeContent.sectionTitle}</h2>
            <p className="text-gray-600">{safeContent.sectionDescription}</p>
          </div>
          <div className="text-center p-12">
            <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-4 bg-white md:py-16">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6 text-center md:mb-12">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-full">
            {safeContent.badgeText}
          </span>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{safeContent.sectionTitle}</h2>
          <p className="text-gray-600">{safeContent.sectionDescription}</p>
        </div>

        {/* Reviews Carousel Container */}
        <div className="relative mx-auto max-w-6xl">
          {/* Previous Button */}
          <button 
            onClick={prevReview}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 z-10 p-2 bg-white rounded-full shadow-lg transition-shadow -translate-x-4 -translate-y-1/2 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" 
            aria-label="Previous reviews"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7 7-7-7"/>
            </svg>
          </button>

          {/* Reviews Wrapper */}
          <div className="overflow-hidden">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / reviewsPerView)}%)` }}
            >
              {reviews.map((review: any, index: number) => (
                <div 
                  key={index} 
                  className={`flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] p-6 bg-white rounded-xl shadow-sm`}
                >
                  <div className="flex items-center mb-4">
                    <div className="flex justify-center items-center w-10 h-10 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                      {review.author?.substring(0, 1) || '?'}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900">{review.author || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500">{review.country || 'Unknown'} • {review.date || 'Recently'}</div>
                    </div>
                  </div>

                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i}
                        className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>

                  <h4 className="mb-2 text-sm font-bold text-gray-900">{review.title || 'Great Experience'}</h4>
                  <p className="text-sm leading-relaxed text-gray-600">{review.text || 'No comment provided.'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button 
            onClick={nextReview}
            disabled={currentIndex >= totalReviews - reviewsPerView}
            className="absolute right-0 top-1/2 z-10 p-2 bg-white rounded-full shadow-lg transition-shadow translate-x-4 -translate-y-1/2 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" 
            aria-label="Next reviews"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}