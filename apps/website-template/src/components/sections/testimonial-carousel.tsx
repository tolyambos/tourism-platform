'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location?: string;
  rating: number;
  text: string;
  image?: string;
  date?: string;
}

interface TestimonialCarouselProps {
  content: {
    title: string;
    subtitle?: string;
    testimonials: Testimonial[];
    autoplay?: boolean;
    autoplayDelay?: number;
  };
}

export default function TestimonialCarousel({ content }: TestimonialCarouselProps) {
  const { title, subtitle, testimonials } = content;
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  const currentTestimonial = testimonials[currentIndex];
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p 
              className="text-lg text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        
        {/* Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              {/* Rating */}
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={i < currentTestimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-center mb-6">
                <p className="text-lg text-gray-700 italic">
                  &ldquo;{currentTestimonial.text}&rdquo;
                </p>
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center justify-center">
                {currentTestimonial.image && (
                  <div className="relative w-12 h-12 mr-4 rounded-full overflow-hidden">
                    <Image
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{currentTestimonial.name}</p>
                  {currentTestimonial.location && (
                    <p className="text-sm text-gray-600">{currentTestimonial.location}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full p-2 text-gray-600 hover:text-gray-900"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full p-2 text-gray-600 hover:text-gray-900"
                aria-label="Next testimonial"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </div>
        
        {/* Dots indicator */}
        {testimonials.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}