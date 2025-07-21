'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface CTASectionProps {
  content: {
    title: string;
    subtitle?: string;
    primaryCtaText: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    backgroundImage?: string;
    backgroundColor?: string;
    theme?: 'light' | 'dark';
  };
}

export default function CTASection({ content }: CTASectionProps) {
  const {
    title,
    subtitle,
    primaryCtaText,
    primaryCtaLink = '#',
    secondaryCtaText,
    secondaryCtaLink = '#',
    backgroundImage,
    backgroundColor = 'bg-primary',
    theme = 'dark'
  } = content;
  
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subtitleColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-600';
  
  return (
    <section 
      className={`relative py-16 px-4 sm:px-6 lg:px-8 ${!backgroundImage ? backgroundColor : ''}`}
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      {/* Overlay for background image */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black opacity-50" />
      )}
      
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.h2 
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${textColor}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>
        
        {subtitle && (
          <motion.p 
            className={`text-lg sm:text-xl mb-8 ${subtitleColor}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href={primaryCtaLink}
            className={`inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 ${
              theme === 'dark' 
                ? 'bg-white text-gray-900 hover:bg-gray-100' 
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {primaryCtaText}
          </Link>
          
          {secondaryCtaText && (
            <Link
              href={secondaryCtaLink}
              className={`inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-all border-2 ${
                theme === 'dark'
                  ? 'border-white text-white hover:bg-white hover:text-gray-900'
                  : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
              }`}
            >
              {secondaryCtaText}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}