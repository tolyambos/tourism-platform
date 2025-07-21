'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign } from 'lucide-react';

interface Attraction {
  id: string;
  name: string;
  description: string;
  image: string;
  location?: string;
  duration?: string;
  price?: string;
  link?: string;
}

interface AttractionGridProps {
  content: {
    title: string;
    subtitle?: string;
    attractions: Attraction[];
    columns?: number;
  };
}

export default function AttractionGrid({ content }: AttractionGridProps) {
  const { title, subtitle, attractions, columns = 3 } = content;
  
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
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
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        
        {/* Grid */}
        <div className={`grid ${gridCols} gap-6 md:gap-8`}>
          {attractions.map((attraction, index) => (
            <motion.div
              key={attraction.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link 
                href={attraction.link || '#'}
                className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={attraction.image}
                    alt={attraction.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {attraction.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {attraction.description}
                  </p>
                  
                  {/* Meta info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {attraction.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{attraction.location}</span>
                      </div>
                    )}
                    {attraction.duration && (
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{attraction.duration}</span>
                      </div>
                    )}
                    {attraction.price && (
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} />
                        <span>{attraction.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}