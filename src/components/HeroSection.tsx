import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SimpleImage } from "./SimpleImage";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <SimpleImage 
          src={heroImage} 
          alt="Modern minimalist fashion" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-black/50"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container-sohrel text-center text-brand-white">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-hero mb-6">
            MINIMALISM
            <br />
            REDEFINED
          </h1>
          <p className="text-subtitle mb-8 max-w-2xl mx-auto">
            Premium T-shirts for the modern soul. Crafted with precision, 
            designed for those who appreciate the beauty of simplicity.
          </p>
          <Link to="/shop">
            <Button size="lg" className="btn-sohrel-secondary">
              SHOP NOW
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;