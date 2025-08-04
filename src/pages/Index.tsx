import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import AdSliderSection from "@/components/AdSliderSection";
import CategoriesSection from "@/components/CategoriesSection";
import AboutSection from "@/components/AboutSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
        <AdSliderSection />
        <AboutSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;