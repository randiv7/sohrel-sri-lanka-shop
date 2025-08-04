import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
    src: "/src/assets/ad1.jpg",
    alt: "Summer Collection 2024",
    title: "Summer Collection",
    subtitle: "Discover Light & Airy Essentials",
    linkTo: "/collections",
    fallback: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&crop=center"
  },
  {
    src: "/src/assets/ad2.jpg", 
    alt: "Sustainable Materials",
    title: "Sustainable Luxury",
    subtitle: "Crafted for Tomorrow",
    linkTo: "/about",
    fallback: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&crop=center"
  },
  {
    src: "/src/assets/ad3.jpg",
    alt: "New Arrivals",
    title: "New Arrivals",
    subtitle: "Limited Edition Pieces",
    linkTo: "/shop",
    fallback: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop&crop=center"
  }
];

const AdSliderSection = () => {
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

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

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[3/2] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Desktop: 3-image grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {adImages.map((image, index) => (
            <Link
              key={index}
              to={image.linkTo}
              className="group relative block aspect-[3/2] overflow-hidden rounded-lg bg-muted transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <SimpleImage
                src={loadedImages[index] || image.fallback}
                alt={image.alt}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              {(image.title || image.subtitle) && (
                <div className="absolute bottom-6 left-6 text-white">
                  {image.title && (
                    <h3 className="text-xl font-semibold mb-1 tracking-wide">{image.title}</h3>
                  )}
                  {image.subtitle && (
                    <p className="text-sm opacity-90 font-light">{image.subtitle}</p>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden">
          <Carousel className="w-full">
            <CarouselContent>
              {adImages.map((image, index) => (
                <CarouselItem key={index}>
                  <Link
                    to={image.linkTo}
                    className="group relative block aspect-[3/2] overflow-hidden rounded-lg bg-muted transition-all duration-300"
                  >
                    <SimpleImage
                      src={loadedImages[index] || image.fallback}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-all duration-500 group-active:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80" />
                    {(image.title || image.subtitle) && (
                      <div className="absolute bottom-6 left-6 text-white">
                        {image.title && (
                          <h3 className="text-xl font-semibold mb-1 tracking-wide">{image.title}</h3>
                        )}
                        {image.subtitle && (
                          <p className="text-sm opacity-90 font-light">{image.subtitle}</p>
                        )}
                      </div>
                    )}
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default AdSliderSection;