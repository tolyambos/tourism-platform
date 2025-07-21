'use client';

import Image from 'next/image';
import { MapPin, Clock, Star } from 'lucide-react';

interface Attraction {
  name: string;
  description: string;
  imagePrompt?: string;
  imageUrl?: string;
  category: string;
  highlights: string[];
  visitDuration?: string;
  bestTimeToVisit?: string;
  rating?: number;
}

interface AttractionsGridProps {
  content: {
    sectionTitle: string;
    sectionDescription: string;
    attractions: Attraction[];
  };
}

export default function AttractionsGrid({ content }: AttractionsGridProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.sectionTitle || 'Top Attractions'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {content.sectionDescription || 'Discover the most popular attractions'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {content.attractions?.map((attraction, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 bg-gray-200">
                {(attraction.imageUrl || attraction.imagePrompt) && (
                  <Image
                    src={attraction.imageUrl || `/api/placeholder?text=${encodeURIComponent(attraction.name)}`}
                    alt={attraction.name}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-sm font-medium text-gray-700">
                  {attraction.category}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {attraction.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {attraction.description}
                </p>

                {attraction.highlights && attraction.highlights.length > 0 && (
                  <div className="mb-3">
                    <ul className="text-sm text-gray-500 space-y-1">
                      {attraction.highlights.slice(0, 3).map((highlight, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          <span className="line-clamp-1">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  {attraction.visitDuration && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{attraction.visitDuration}</span>
                    </div>
                  )}
                  
                  {attraction.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                      <span>{attraction.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}