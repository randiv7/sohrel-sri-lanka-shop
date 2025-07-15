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

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProductImage = (product: Product) => {
    const primaryImage = product.product_images?.find(img => img.is_primary);
    return primaryImage?.image_url || '/placeholder.svg';
  };

  if (loading) {
    return (
      <section className="section-padding bg-brand-grey-light">
        <div className="container-sohrel">
          <h2 className="text-section-title text-center mb-12">FEATURED PRODUCTS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="product-card-sohrel animate-pulse">
                <div className="aspect-square bg-muted"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show placeholder products if no featured products exist
  const placeholderProducts = [
    {
      id: 'placeholder-1',
      name: 'Classic Black Tee',
      slug: 'classic-black-tee',
      price: 2500,
      short_description: 'Essential minimalist black t-shirt',
      is_featured: true,
    },
    {
      id: 'placeholder-2',
      name: 'Pure White Essential',
      slug: 'pure-white-essential',
      price: 2500,
      short_description: 'Clean white minimalist design',
      is_featured: true,
    },
    {
      id: 'placeholder-3',
      name: 'Oversized Comfort',
      slug: 'oversized-comfort',
      price: 2800,
      short_description: 'Relaxed fit oversized style',
      is_featured: true,
    },
    {
      id: 'placeholder-4',
      name: 'Typography Design',
      slug: 'typography-design',
      price: 2700,
      short_description: 'Modern typography artwork',
      is_featured: true,
    },
  ];

  const displayProducts = products.length > 0 ? products : placeholderProducts;

  return (
    <section className="section-padding bg-brand-grey-light">
      <div className="container-sohrel">
        <h2 className="text-section-title text-center mb-12">FEATURED PRODUCTS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
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