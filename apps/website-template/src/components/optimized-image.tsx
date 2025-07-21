'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { getBlurDataURL, getResponsiveSizes } from '@/lib/image-optimization';

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  type?: 'hero' | 'card' | 'thumbnail' | 'gallery';
  fallback?: string;
}

export function OptimizedImage({ 
  type = 'card',
  fallback = '/images/placeholder.jpg',
  sizes,
  ...props 
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  
  // Use fallback image on error
  const imageSrc = error ? fallback : props.src;
  
  // Get responsive sizes based on image type
  const responsiveSizes = sizes || getResponsiveSizes(type);
  
  return (
    <Image
      {...props}
      src={imageSrc}
      sizes={responsiveSizes}
      placeholder="blur"
      blurDataURL={getBlurDataURL()}
      loading={props.priority ? 'eager' : 'lazy'}
      quality={props.quality || 85}
      onError={() => setError(true)}
      className={`${props.className || ''} ${error ? 'opacity-50' : ''}`}
    />
  );
}