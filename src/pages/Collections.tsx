import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  _count?: {
    products: number;
  };
}

const Collections = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
        return;
      }

      console.log('Categories fetched:', data?.length || 0, 'categories');
      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Collections
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Explore our carefully curated collections of premium t-shirts, each designed 
            with a unique aesthetic and purpose in mind.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {categories.map((category) => (
            <Link key={category.id} to={`/shop?category=${category.slug}`}>
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-64 md:h-80">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <Badge variant="secondary" className="w-fit mb-3">
                      Collection
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-white/90 text-sm md:text-base mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <span>Explore Collection</span>
                      <svg 
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Featured Collection Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            Browse our complete product catalog to discover all available designs, 
            styles, and sizes across all collections.
          </p>
          <Link to="/shop">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              View All Products
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Collections;