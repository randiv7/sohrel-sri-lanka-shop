import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  product_count?: number;
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
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          is_active
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Collections
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our curated collections of premium t-shirts, each telling its own story
            </p>
          </div>

          {/* Loading Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
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
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Collections
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our curated collections of premium t-shirts, each telling its own story
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category) => (
            <Link key={category.id} to={`/shop?category=${category.slug}`}>
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-500 overflow-hidden bg-white">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image_url || '/placeholder.svg'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Lighter overlay for better image visibility */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <Badge variant="secondary" className="w-fit mb-3 bg-white/90 text-black">
                      Collection
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-white transition-colors duration-300">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-white/90 text-sm md:text-base mb-4 line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <span>Explore Collection</span>
                      <svg 
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
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

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No collections available at the moment.
            </p>
            <Link to="/shop">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Browse All Products
              </button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Collections;