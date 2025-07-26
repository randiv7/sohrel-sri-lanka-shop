
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: string;
  priority?: boolean;
}

export const ProductImage = ({ 
  src, 
  alt, 
  className = "", 
  fallback = "https://placehold.co/800x800/f3f4f6/6b7280?text=Product+Image",
  priority = false
}: ProductImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  const handleError = () => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn("w-full h-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      onError={handleError}
    />
  );
};
