import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { SimpleImage } from "./SimpleImage";
const HeroSection = () => {
  const sliderImages = [
    {
      title: "Work",
      images: [
        "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      title: "Tech",
      images: [
        "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      title: "Nature",
      images: [
        "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?auto=format&fit=crop&w=800&q=80"
      ]
    }
  ];

  return (
    <section className="bg-brand-black text-brand-white section-padding min-h-[80vh] flex items-center">
      <div className="container-sohrel">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left animate-fade-in">
            <h1 className="text-hero mb-6">
              MINIMALISM
              <br />
              REDEFINED
            </h1>
            <p className="text-subtitle mb-8">
              Premium T-shirts for the modern soul. Crafted with precision, 
              designed for those who appreciate the beauty of simplicity.
            </p>
            <Link to="/shop">
              <Button size="lg" className="btn-sohrel-secondary">
                SHOP NOW
              </Button>
            </Link>
          </div>

          {/* Right side - Image sliders */}
          <div className="space-y-8 animate-fade-in">
            {sliderImages.map((slider, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-medium text-brand-white/80 mb-3">{slider.title}</h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {slider.images.map((image, imageIndex) => (
                      <CarouselItem key={imageIndex} className="basis-1/2 md:basis-1/3">
                        <div className="aspect-square overflow-hidden rounded-lg">
                          <SimpleImage
                            src={image}
                            alt={`${slider.title} ${imageIndex + 1}`}
                            className="w-full h-full object-cover hover-scale"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="bg-brand-white/10 border-brand-white/20 text-brand-white hover:bg-brand-white/20" />
                  <CarouselNext className="bg-brand-white/10 border-brand-white/20 text-brand-white hover:bg-brand-white/20" />
                </Carousel>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;