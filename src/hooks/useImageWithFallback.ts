
import { useState, useCallback } from 'react';

export const useImageWithFallback = (src: string, fallback: string = '/placeholder.svg') => {
  const [imgSrc, setImgSrc] = useState(src || fallback);
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

  return {
    src: imgSrc,
    isLoading,
    hasError,
    onLoad: handleLoad,
    onError: handleError
  };
};
