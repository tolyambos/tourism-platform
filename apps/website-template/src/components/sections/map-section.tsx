'use client';

import { motion } from 'framer-motion';

interface MapSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    latitude: number;
    longitude: number;
    zoom?: number;
    height?: string;
    markers?: Array<{
      id: string;
      lat: number;
      lng: number;
      title: string;
    }>;
  };
}

export default function MapSection({ content }: MapSectionProps) {
  const { title, subtitle, latitude, longitude, height = '400px' } = content;
  
  // For now, using an iframe with OpenStreetMap
  // In production, you'd use a proper map library like Mapbox or Google Maps
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <motion.h2 
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {title}
              </motion.h2>
            )}
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
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-lg overflow-hidden shadow-lg"
          style={{ height }}
        >
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={mapUrl}
            className="w-full h-full"
          />
        </motion.div>
      </div>
    </section>
  );
}