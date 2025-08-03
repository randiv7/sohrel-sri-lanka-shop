import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Hero images - using dynamic imports to handle missing files gracefully
  const heroImages = [
    { 
      src: "/src/assets/hero1.png", 
      alt: "Premium minimalist collection 1",
      fallback: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop"
    },
    { 
      src: "/src/assets/hero2.png", 
      alt: "Premium minimalist collection 2",
      fallback: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=1080&fit=crop"
    },
    { 
      src: "/src/assets/hero3.png", 
      alt: "Premium minimalist collection 3",
      fallback: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1920&h=1080&fit=crop"
    }
  ];

  // Load images with fallback support
  useEffect(() => {
    const loadImages = async () => {
      const imageLoadPromises = heroImages.map(async (image, index) => {
        try {
          const img = new Image();
          return new Promise<string>((resolve) => {
            img.onload = () => resolve(image.src);
            img.onerror = () => {
              console.log(`Hero image ${index + 1} not found, using fallback`);
              resolve(image.fallback);
            };
            img.src = image.src;
          });
        } catch (error) {
          console.log(`Using fallback for hero image ${index + 1}`);
          return image.fallback;
        }
      });

      try {
        const resolvedImages = await Promise.all(imageLoadPromises);
        setLoadedImages(resolvedImages);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading hero images:", error);
        setLoadedImages(heroImages.map(img => img.fallback));
        setIsLoaded(true);
      }
    };

    loadImages();
  }, []);

  // Auto-slide functionality with infinite loop
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 50); // Small delay to trigger transition
    }, 4000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [isLoaded, heroImages.length]);

  // Create extended array for seamless infinite loop
  const getExtendedImages = () => {
    if (loadedImages.length === 0) return [];
    
    // Create array with: [last, ...all, first, second]
    // This allows seamless transitions in both directions
    return [
      loadedImages[loadedImages.length - 1], // Last image at start
      ...loadedImages,                        // All original images
      loadedImages[0],                        // First image at end
      loadedImages[1]                         // Second image for smooth continuation
    ];
  };

  const extendedImages = getExtendedImages();
  const extendedIndex = currentIndex + 1; // Offset by 1 because we added last image at start

  // Loading state
  if (!isLoaded) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm uppercase tracking-wider">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Image Slider Background */}
      <div className="absolute inset-0">
        <div 
          className="flex h-full transition-transform duration-1000 ease-in-out"
          style={{
            width: `${extendedImages.length * 100}%`,
            transform: `translateX(-${extendedIndex * (100 / extendedImages.length)}%)`
          }}
        >
          {extendedImages.map((imageSrc, index) => (
            <div
              key={index}
              className="relative w-full h-full flex-shrink-0"
              style={{ width: `${100 / extendedImages.length}%` }}
            >
              <img
                src={imageSrc}
                alt={heroImages[currentIndex]?.alt || "Hero image"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed opacity-90">
            Premium essentials for the modern soul. Crafted with precision, 
            designed for those who appreciate the beauty of simplicity.
          </p>
          <div className="flex justify-center">
            <Link to="/shop">
              <Button className="bg-black text-white hover:bg-gray-800 text-sm sm:text-base font-medium uppercase tracking-widest px-8 sm:px-12 py-4 sm:py-5 h-auto transition-all duration-300 min-h-[48px] min-w-[200px]">
                EXPLORE COLLECTION
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center ${
              index === currentIndex 
                ? 'bg-white/20' 
                : 'bg-white/10 hover:bg-white/15'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className={`rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-6 h-3' 
                : 'bg-white/60 w-3 h-3 hover:bg-white/80'
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;