'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getDefaultProductCardsContent, mergeWithDefaults } from './safe-wrappers';

interface ProductCardsProps {
  content?: any;
}

export default function ProductCards({ content }: ProductCardsProps) {
  const safeContent = mergeWithDefaults(getDefaultProductCardsContent(), content);
  const [activeCarousels, setActiveCarousels] = useState<{[key: number]: number}>({});

  const updateCarousel = (cardIndex: number, slideIndex: number) => {
    setActiveCarousels(prev => ({ ...prev, [cardIndex]: slideIndex }));
  };

  const productCards = safeContent.productCards || [];

  return (
    <section id="featured-experiences" className="py-6 bg-gray-50 md:py-12">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-4 text-center md:mb-8">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-medium text-pink-700 bg-pink-100 rounded-full">
            {safeContent.badgeText}
          </span>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">{safeContent.sectionTitle}</h2>
          <p className="text-gray-600">{safeContent.sectionDescription}</p>
        </div>

        {productCards.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-sm max-w-3xl mx-auto">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500">No tours or experiences available at the moment.</p>
          </div>
        ) : (
          <div className="mx-auto space-y-6 max-w-5xl">
            {productCards.map((card: any, cardIndex: number) => {
              const images = card.images || [];
              const hasImages = images.length > 0;
              
              return (
                <div key={cardIndex} className="overflow-hidden bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg group">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image Section */}
                    <div className="overflow-hidden relative flex-shrink-0 w-full h-48 sm:w-72 sm:h-48">
                      <div 
                        className="flex h-full transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${(activeCarousels[cardIndex] || 0) * 100}%)` }}
                      >
                        {hasImages ? (
                          images.map((image: string, imgIndex: number) => (
                            <div key={imgIndex} className="relative flex-shrink-0 w-full h-full">
                              <Image
                                src={image}
                                alt={`${card.name} - Image ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="relative flex-shrink-0 w-full h-full bg-gray-200">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Carousel Dots */}
                      {hasImages && images.length > 1 && (
                        <div className="flex absolute bottom-2 left-1/2 gap-0 transform -translate-x-1/2">
                          {images.map((_: any, index: number) => (
                            <button
                              key={index}
                              className="flex relative justify-center items-center w-12 h-12"
                              onClick={() => updateCarousel(cardIndex, index)}
                              aria-label={`Go to slide ${index + 1}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                (activeCarousels[cardIndex] || 0) === index ? 'bg-white/80' : 'bg-white/40'
                              }`} />
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Badge */}
                      {card.badges && card.badges.length > 0 && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                            {card.badges[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 items-center mb-2">
                              <div className="flex gap-2 items-center">
                                <span className="px-2 py-0.5 text-xs font-bold text-white bg-pink-600 rounded sm:text-sm">★ {card.rating || 0}</span>
                                <span className="text-xs text-gray-600 sm:text-sm">({card.reviewCount || 0} reviews)</span>
                              </div>
                              {card.duration && (
                                <div className="flex gap-2 items-center">
                                  <span className="hidden text-gray-400 sm:inline">•</span>
                                  <span className="text-xs text-gray-600 sm:text-sm">{card.duration}</span>
                                </div>
                              )}
                            </div>
                            <h3 className="mb-2 text-base font-bold text-gray-900 transition-colors line-clamp-2 sm:text-lg group-hover:text-blue-600">
                              {card.name || 'Unnamed Experience'}
                            </h3>
                          </div>
                          <div className="ml-2 text-right sm:ml-4">
                            <div className="text-xl font-bold text-purple-600 sm:text-2xl">
                              {card.currency || '€'}{card.price || '0'}
                            </div>
                            <p className="text-xs text-gray-500 whitespace-nowrap">per person</p>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                          {card.description || 'No description available.'}
                        </p>
                        
                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {card.features?.freeCancellation && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                              ✓ Free cancellation
                            </span>
                          )}
                          {card.features?.instantConfirmation && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full">
                              ✓ Instant confirmation
                            </span>
                          )}
                          {card.features?.hotelPickup && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                              ✓ Hotel pickup
                            </span>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-between items-center mt-auto">
                          <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
                            View details →
                          </button>
                          <a href="#" className="px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-lg transition-colors hover:bg-purple-700">
                            Book Now
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}