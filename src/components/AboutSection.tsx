import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SimpleImage } from "@/components/SimpleImage";

const AboutSection = () => {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8 lg:pr-8">
            <div>
              <h2 className="text-section-title text-liora-black mb-8 leading-tight">
                CRAFTED FOR THE
                <br />
                <span className="font-light tracking-wide-plus">MINDFUL SOUL</span>
              </h2>
              <div className="divider-section mb-10"></div>
            </div>
            
            <div className="space-y-8 text-liora-grey-dark leading-relaxed">
              <p className="text-lg md:text-xl">
                At LIORA, we believe that true elegance emerges from conscious simplicity. 
                Each piece is meticulously designed and thoughtfully crafted 
                to embody the essence of modern minimalism.
              </p>
              <p className="text-base md:text-lg">
                Our premium essentials are created from the finest sustainable materials, 
                ensuring lasting comfort while maintaining the clean, 
                sophisticated aesthetic that defines contemporary living.
              </p>
              <p className="text-base md:text-lg">
                From concept to creation, every LIORA piece tells a story 
                of intentional design, mindful craftsmanship, and timeless beauty that transcends 
                fleeting trends.
              </p>
            </div>
            
            <div className="pt-6">
              <Link to="/about">
                <Button className="btn-liora-primary">
                  DISCOVER OUR STORY
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Image */}
          <div className="relative lg:pl-8">
            <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
              <SimpleImage
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop"
                alt="LIORA Brand Story - Mindful Design"
                className="w-full h-full object-cover hover-float"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10"></div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 border border-gray-200 -z-10 hidden lg:block"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gray-50 -z-10 hidden lg:block"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;