import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SimpleImage } from "@/components/SimpleImage";

const AboutSection = () => {
  return (
    <section className="section-padding bg-brand-white">
      <div className="container-sohrel">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-section-title">
              CRAFTED FOR THE
              <br />
              CONSCIOUS SOUL
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                At SOHREL, we believe that true style lies in simplicity. 
                Each piece is thoughtfully designed and carefully crafted 
                to embody the essence of minimalist fashion.
              </p>
              <p>
                Our premium t-shirts are made from the finest materials, 
                ensuring comfort that lasts while maintaining the clean, 
                sophisticated aesthetic that defines modern minimalism.
              </p>
              <p>
                From concept to creation, every SOHREL piece tells a story 
                of quality, consciousness, and timeless design.
              </p>
            </div>
            <Link to="/about">
              <Button className="btn-sohrel-primary">
                OUR STORY
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="w-full h-96 overflow-hidden">
              <SimpleImage
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop"
                alt="SOHREL Brand Story"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-brand-black opacity-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;