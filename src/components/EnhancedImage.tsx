
import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const FALLBACK_URLS = [
  'https://placehold.co/800x800/f3f4f6/6b7280?text=Product+Image',
  'https://picsum.photos/800/800?blur=2&grayscale',
  // Local SVG fallback as last resort
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDgwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMjAgMzYwSDQ4MFY0NDBIMzIwVjM2MFoiIGZpbGw9IiM2QjcyODAiLz4KPHN2ZyB4PSIzNzAiIHk9IjM3MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiLz4KPGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz4KPHBhdGggZD0ibTIxIDE1LTMuMDg2LTMuMDg2YTIgMiAwIDAgMC0yLjgyOCAwTDYgMjEiLz4KPC9zdmc+Cjx0ZXh0IHg9IjQwMCIgeT0iNDgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2QjcyODAiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo='
];

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

export const EnhancedImage = ({ 
  src, 
  alt, 
  className = "", 
  width = 800,
  height = 800,
  priority = false,
  onLoad,
  onError
}: EnhancedImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src || FALLBACK_URLS[0]);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    console.log('Image failed to load:', currentSrc);
    setHasError(true);
    onError?.();

    // Simple fallback - try next URL in the list
    const currentIndex = FALLBACK_URLS.indexOf(currentSrc);
    if (currentIndex < FALLBACK_URLS.length - 1) {
      const nextUrl = FALLBACK_URLS[currentIndex + 1];
      console.log('Moving to fallback:', nextUrl);
      setCurrentSrc(nextUrl);
    }
  }, [currentSrc, onError]);

  // Update src when prop changes
  useEffect(() => {
    if (src && src !== currentSrc && !hasError) {
      setCurrentSrc(src);
      setHasError(false);
    }
  }, [src, currentSrc, hasError]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      className={cn("w-full h-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
    />
  );
};
