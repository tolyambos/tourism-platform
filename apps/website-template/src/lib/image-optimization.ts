import { ImageLoaderProps } from 'next/image';

// Cloudflare Images loader
export const cloudflareLoader = ({ src, width, quality }: ImageLoaderProps) => {
  const params = [`width=${width}`];
  
  if (quality) {
    params.push(`quality=${quality}`);
  }
  
  // Cloudflare Images URL format
  const paramsString = params.join(',');
  return `https://images.tourism-platform.com/cdn-cgi/image/${paramsString}/${src}`;
};

// Cloudinary loader
export const cloudinaryLoader = ({ src, width, quality }: ImageLoaderProps) => {
  const params = ['f_auto', 'c_limit', `w_${width}`];
  
  if (quality) {
    params.push(`q_${quality}`);
  }
  
  const paramsString = params.join(',');
  return `https://res.cloudinary.com/tourism-platform/image/upload/${paramsString}/${src}`;
};

// Image blur data URL generator
export function getBlurDataURL(width: number = 10, height: number = 10): string {
  const blurSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <filter id="blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
      </filter>
      <rect width="100%" height="100%" fill="#e0e0e0" filter="url(#blur)" />
    </svg>
  `;
  
  const base64 = Buffer.from(blurSvg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Generate responsive image sizes
export function getResponsiveSizes(type: 'hero' | 'card' | 'thumbnail' | 'gallery') {
  switch (type) {
    case 'hero':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px';
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'thumbnail':
      return '(max-width: 640px) 50vw, 200px';
    case 'gallery':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px';
    default:
      return '100vw';
  }
}

// Image optimization utilities
export const imageOptimization = {
  // Get optimized image URL
  getOptimizedUrl(src: string, options: { width?: number; quality?: number } = {}) {
    const { width = 800, quality = 80 } = options;
    
    // If it's already a CDN URL, return as is
    if (src.includes('cloudflare') || src.includes('cloudinary')) {
      return src;
    }
    
    // Use Cloudflare Images for optimization
    return cloudflareLoader({ src, width, quality });
  },
  
  // Preload critical images
  preloadImage(src: string, options: { as?: string; type?: string } = {}) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = options.as || 'image';
    link.href = src;
    
    if (options.type) {
      link.type = options.type;
    }
    
    document.head.appendChild(link);
  },
  
  // Lazy load images with Intersection Observer
  lazyLoadImages(selector: string = 'img[data-lazy]') {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }
    
    const images = document.querySelectorAll(selector);
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-lazy');
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    images.forEach((img) => imageObserver.observe(img));
  }
};