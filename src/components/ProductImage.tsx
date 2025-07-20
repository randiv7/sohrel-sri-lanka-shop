import { useState, useCallback } from 'react';
import { Skeleton } from './ui/skeleton';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: string;
}

export const ProductImage = ({ 
  src, 
  alt, 
  className = "", 
  fallback = "https://via.placeholder.com/800x800/f3f4f6/6b7280?text=Product+Image" 
}: ProductImageProps) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    console.log('Image failed to load:', imgSrc, 'falling back to:', fallback);
    setImgSrc(fallback);
    setIsLoading(false);
    setHasError(true);
  }, [imgSrc, fallback]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        loading="lazy"
      />
    </div>
  );
};