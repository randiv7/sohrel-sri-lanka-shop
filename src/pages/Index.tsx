import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import CategoriesSection from "@/components/CategoriesSection";
import AboutSection from "@/components/AboutSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <CategoriesSection />
        <AboutSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
