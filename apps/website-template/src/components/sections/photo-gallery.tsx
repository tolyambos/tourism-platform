'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface GalleryImage {
  caption: string;
  imagePrompt?: string;
  imageUrl?: string;
  category: string;
}

interface PhotoGalleryProps {
  content: {
    sectionTitle: string;
    sectionDescription: string;
    images: GalleryImage[];
  };
}

export default function PhotoGallery({ content }: PhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', ...new Set(content.images?.map(img => img.category) || [])];
  const filteredImages = selectedCategory === 'all' 
    ? content.images 
    : content.images?.filter(img => img.category === selectedCategory);
    
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.sectionTitle || 'Photo Gallery'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            {content.sectionDescription || 'Explore through images'}
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {filteredImages?.map((image, index) => (
            <div
              key={index}
              className="break-inside-avoid mb-4 cursor-pointer group"
              onClick={() => setSelectedImage(index)}
            >
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src={image.imageUrl || `/api/placeholder?text=${encodeURIComponent(image.caption)}`}
                  alt={image.caption}
                  width={400}
                  height={300}
                  className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium">{image.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && filteredImages && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="max-w-4xl max-h-full relative" onClick={(e) => e.stopPropagation()}>
              <Image
                src={filteredImages[selectedImage].imageUrl || `/api/placeholder?text=${encodeURIComponent(filteredImages[selectedImage].caption)}`}
                alt={filteredImages[selectedImage].caption}
                width={1200}
                height={800}
                className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
              />
              <p className="text-white text-center mt-4">
                {filteredImages[selectedImage].caption}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}