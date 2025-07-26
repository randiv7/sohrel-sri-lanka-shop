import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const HeroSection = () => {
  return <section className="bg-brand-black text-brand-white section-padding min-h-[80vh] flex items-center">
      <div className="container-sohrel">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
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
            <Button size="lg" className="btn-sohrel-secondary text-brand-white border-brand-white hover:bg-brand-white hover:text-brand-black text-base bg-zinc-950 hover:bg-zinc-800 text-slate-50">
              SHOP NOW
            </Button>
          </Link>
        </div>
      </div>
    </section>;
};
export default HeroSection;