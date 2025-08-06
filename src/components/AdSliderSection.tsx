import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface AdImage {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  linkTo: string;
}

// Updated to use correct image filenames: ban1.jpeg, ban2.jpeg, ban3.jpeg
const adImages: AdImage[] = [
  {
    src: "/assets/ban1.jpeg", // Updated filename
    alt: "Summer Collection 2024",
    title: "Summer Collection",
    subtitle: "Discover Light & Airy Essentials",
    linkTo: "/collections"
  },
  {
    src: "/assets/ban2.jpeg", // Updated filename
    alt: "Sustainable Materials",
    title: "Sustainable Luxury",
    subtitle: "Crafted for Tomorrow",
    linkTo: "/about"
  },
  {
    src: "/assets/ban3.jpeg", // Updated filename - Note: you mentioned "ban3.jepg" but I assume you meant "ban3.jpeg"
    alt: "New Arrivals",
    title: "New Arrivals",
    subtitle: "Limited Edition Pieces",
    linkTo: "/shop"
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
    // Simply use the image paths directly - no complex loading logic
    const newLoadedImages: { [key: number]: string } = {};
    adImages.forEach((image, index) => {
      newLoadedImages[index] = image.src;
      console.log(`Ad image ${index + 1} path:`, image.src);
    });
    
    setLoadedImages(newLoadedImages);
    setIsLoading(false);
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
  const currentImageSrc = loadedImages[currentIndex] || currentImage.src;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="relative aspect-[16/9] md:aspect-[3/1] overflow-hidden rounded-lg bg-muted group">
          <Link
            to={currentImage.linkTo}
            className="block w-full h-full"
          >
            <img
              src={currentImageSrc}
              alt={currentImage.alt}
              className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
              }`}
              onError={(e) => {
                console.warn(`Failed to load ad image: ${currentImageSrc}`);
                // Hide the broken image instead of showing a placeholder
                e.currentTarget.style.display = 'none';
              }}
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