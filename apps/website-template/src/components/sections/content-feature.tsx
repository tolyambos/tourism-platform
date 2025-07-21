'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Feature {
  id: string;
  text: string;
}

interface ContentFeatureProps {
  content: {
    title: string;
    subtitle?: string;
    description: string;
    features?: Feature[];
    image?: string;
    imagePosition?: 'left' | 'right';
    ctaText?: string;
    ctaLink?: string;
  };
}

export default function ContentFeature({ content }: ContentFeatureProps) {
  const {
    title,
    subtitle,
    description,
    features = [],
    image,
    imagePosition = 'right',
    ctaText,
    ctaLink
  } = content;
  
  const imageOnLeft = imagePosition === 'left';
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${imageOnLeft ? 'lg:flex-row-reverse' : ''}`}>
          {/* Content */}
          <motion.div 
            className={imageOnLeft ? 'lg:order-2' : ''}
            initial={{ opacity: 0, x: imageOnLeft ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {subtitle && (
              <p className="text-primary font-semibold mb-2">{subtitle}</p>
            )}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {description}
            </p>
            
            {/* Features list */}
            {features.length > 0 && (
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <motion.li
                    key={feature.id || `feature-${index}`}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Check className="text-green-500 mt-0.5" size={20} />
                    <span className="text-gray-700">{feature.text}</span>
                  </motion.li>
                ))}
              </ul>
            )}
            
            {/* CTA */}
            {ctaText && (
              <Link
                href={ctaLink || '#'}
                className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {ctaText}
              </Link>
            )}
          </motion.div>
          
          {/* Image */}
          {image && (
            <motion.div 
              className={`relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-xl ${imageOnLeft ? 'lg:order-1' : ''}`}
              initial={{ opacity: 0, x: imageOnLeft ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}