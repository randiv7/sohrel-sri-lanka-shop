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
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-6 font-heading leading-tight">
                CRAFTED FOR THE
                <br />
                <span className="font-light">CONSCIOUS SOUL</span>
              </h2>
              <div className="w-16 h-px bg-black mb-8"></div>
            </div>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                At SOHREL, we believe that true style lies in simplicity. 
                Each piece is thoughtfully designed and carefully crafted 
                to embody the essence of minimalist fashion.
              </p>
              <p>
                Our premium essentials are made from the finest materials, 
                ensuring comfort that lasts while maintaining the clean, 
                sophisticated aesthetic that defines modern minimalism.
              </p>
              <p>
                From concept to creation, every SOHREL piece tells a story 
                of quality, consciousness, and timeless design that transcends 
                seasonal trends.
              </p>
            </div>
            
            <div className="pt-4">
              <Link to="/about">
                <Button className="bg-black text-white hover:bg-gray-800 text-sm font-medium uppercase tracking-widest px-10 py-3 h-auto transition-all duration-300">
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
                alt="SOHREL Brand Story"
                className="w-full h-full object-cover"
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