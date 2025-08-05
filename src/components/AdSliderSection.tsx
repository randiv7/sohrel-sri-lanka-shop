import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SimpleImage } from "@/components/SimpleImage";

interface AdImage {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  linkTo: string;
  fallback: string;
}

const adImages: AdImage[] = [
  {
    src: "/src/assets/ban1.jpeg",
    alt: "Summer Collection 2024",
    title: "Summer Collection",
    subtitle: "Discover Light & Airy Essentials",
    linkTo: "/collections",
    fallback: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop&crop=center"
  },
  {
    src: "/src/assets/ban2.jpeg", 
    alt: "Sustainable Materials",
    title: "Sustainable Luxury",
    subtitle: "Crafted for Tomorrow",
    linkTo: "/about",
    fallback: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=500&fit=crop&crop=center"
  },
  {
    src: "/src/assets/ban3.jpeg",
    alt: "New Arrivals",
    title: "New Arrivals",
    subtitle: "Limited Edition Pieces",
    linkTo: "/shop",
    fallback: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=500&fit=crop&crop=center"
  }
];

const AdSliderSection = () => {
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % adImages.length);
          setIsTransitioning(false);
        }, 150);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const loadImages = async () => {
    const imagePromises = adImages.map(async (image, index) => {
      try {
        const img = new Image();
        img.src = image.src;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        return { index, src: image.src };
      } catch {
        return { index, src: image.fallback };
      }
    });

    try {
      const results = await Promise.all(imagePromises);
      const newLoadedImages: { [key: number]: string } = {};
      results.forEach(({ index, src }) => {
        newLoadedImages[index] = src;
      });
      setLoadedImages(newLoadedImages);
    } catch (error) {
      console.error('Error loading ad images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToSlide = (index: number) => {
    if (index !== currentIndex && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 150);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="aspect-[16/9] md:aspect-[3/1] bg-muted animate-pulse rounded-lg"></div>
        </div>
      </section>
    );
  }

  const currentImage = adImages[currentIndex];
  const currentImageSrc = loadedImages[currentIndex] || currentImage.fallback;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="relative aspect-[16/9] md:aspect-[3/1] overflow-hidden rounded-lg bg-muted group">
          <Link
            to={currentImage.linkTo}
            className="block w-full h-full"
          >
            <SimpleImage
              src={currentImageSrc}
              alt={currentImage.alt}
              className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
            {(currentImage.title || currentImage.subtitle) && (
              <div className="absolute bottom-8 left-8 text-white">
                {currentImage.title && (
                  <h3 className="text-2xl md:text-4xl font-bold mb-2 tracking-wide">{currentImage.title}</h3>
                )}
                {currentImage.subtitle && (
                  <p className="text-sm md:text-lg opacity-90 font-light">{currentImage.subtitle}</p>
                )}
              </div>
            )}
          </Link>

          {/* Navigation Dots */}
          <div className="absolute bottom-6 right-8 flex space-x-3">
            {adImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white scale-110'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdSliderSection;