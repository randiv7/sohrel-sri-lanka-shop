
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
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section-padding bg-brand-grey-light">
        <div className="container-sohrel">
          <h2 className="text-section-title text-center mb-12">FEATURED PRODUCTS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="product-card-sohrel">
                <div className="aspect-square bg-muted animate-pulse rounded-lg"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Only show message if no products and not loading
  if (products.length === 0 && !loading) {
    return (
      <section className="section-padding bg-brand-grey-light">
        <div className="container-sohrel">
          <h2 className="text-section-title text-center mb-12">FEATURED PRODUCTS</h2>
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No featured products available at the moment.</p>
            <Link to="/shop">
              <Button className="btn-sohrel-primary mt-4">
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-brand-grey-light">
      <div className="container-sohrel">
        <h2 className="text-section-title text-center mb-12">FEATURED PRODUCTS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/shop">
            <Button className="btn-sohrel-primary">
              VIEW ALL PRODUCTS
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
