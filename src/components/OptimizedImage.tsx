import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const FALLBACK_URL = 'https://placehold.co/800x800/f3f4f6/6b7280?text=Product+Image';

export const OptimizedImage = ({ 
  src, 
  alt, 
  className = "",
  width = 800,
  height = 800
}: OptimizedImageProps) => {
  const imageSrc = src || FALLBACK_URL;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.src !== FALLBACK_URL) {
      target.src = FALLBACK_URL;
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn("w-full h-full object-cover", className)}
      onError={handleError}
      loading="lazy"
    />
  );
};