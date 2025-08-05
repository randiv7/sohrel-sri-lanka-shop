import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  short_description?: string;
  is_featured: boolean;
  product_images?: Array<{
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
  }>;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          sale_price,
          short_description,
          is_featured,
          product_images (
            image_url,
            alt_text,
            is_primary
          )
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(4);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Featured products fetched:', data);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4 font-heading uppercase">
              Featured Products
            </h2>
            <div className="w-24 h-px bg-black mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="group">
                <div className="aspect-square bg-white animate-pulse mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-white rounded animate-pulse"></div>
                  <div className="h-4 bg-white rounded w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4 font-heading uppercase">
              Featured Products
            </h2>
            <div className="w-24 h-px bg-black mx-auto"></div>
          </div>
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-8">No featured products available at the moment.</p>
            <Link to="/shop">
              <Button className="bg-black text-white hover:bg-gray-800 text-sm font-medium uppercase tracking-widest px-10 py-3 h-auto transition-all duration-300">
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4 font-heading uppercase">
            Featured Products
          </h2>
          <div className="w-24 h-px bg-black mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium essentials
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Link to="/shop">
            <Button className="bg-black text-white hover:bg-gray-800 text-sm font-medium uppercase tracking-widest px-10 py-3 h-auto transition-all duration-300">
              VIEW ALL PRODUCTS
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;