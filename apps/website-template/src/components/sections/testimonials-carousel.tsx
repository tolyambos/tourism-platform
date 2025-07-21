'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

interface Testimonial {
  content: string;
  author: string;
  origin: string;
  rating: number;
  visitDate?: string;
}

interface TestimonialsCarouselProps {
  content: {
    sectionTitle: string;
    sectionDescription: string;
    testimonials: Testimonial[];
  };
}

export default function TestimonialsCarousel({ content }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = content.testimonials || [];
  
  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const previousTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  if (!testimonials.length) return null;
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.sectionTitle || 'What Visitors Say'}
          </h2>
          <p className="text-lg text-gray-600">
            {content.sectionDescription || 'Real experiences from real travelers'}
          </p>
        </div>
        
        <div className="relative bg-white rounded-lg shadow-lg p-8 md:p-12">
          <Quote className="absolute top-4 left-4 w-8 h-8 text-blue-100" />
          
          <div className="relative">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonials[currentIndex].rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-lg md:text-xl text-gray-700 italic text-center mb-8">
                "{testimonials[currentIndex].content}"
              </p>
              
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  {testimonials[currentIndex].author}
                </p>
                <p className="text-sm text-gray-600">
                  {testimonials[currentIndex].origin}
                  {testimonials[currentIndex].visitDate && (
                    <span> • {testimonials[currentIndex].visitDate}</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={previousTestimonial}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}