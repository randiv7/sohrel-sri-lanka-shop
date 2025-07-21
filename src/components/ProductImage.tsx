
import { EnhancedImage } from './EnhancedImage';

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
  // Use the original src first, then fallback to the provided fallback
  const imageSource = src || fallback;

  return (
    <EnhancedImage
      src={imageSource}
      alt={alt}
      className={className}
      priority={priority}
    />
  );
};
