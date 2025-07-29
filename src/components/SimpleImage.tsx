interface SimpleImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

const FALLBACK_URL = 'https://placehold.co/400x400/f3f4f6/6b7280?text=Product';

export const SimpleImage = ({ src, alt, className = "" }: SimpleImageProps) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_URL;
  };

  return (
    <img
      src={src || FALLBACK_URL}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};