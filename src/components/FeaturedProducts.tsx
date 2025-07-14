import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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
            <div key={product.id} className="product-card-sohrel group">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.sale_price && (
                  <Badge className="absolute top-3 left-3 bg-brand-black text-brand-white">
                    SALE
                  </Badge>
                )}
                <div className="absolute inset-0 bg-brand-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                    <Button size="sm" className="bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-brand-white border-brand-white hover:bg-brand-black hover:text-brand-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <Link to={`/product/${product.slug}`}>
                  <h3 className="font-medium text-sm uppercase tracking-wider mb-2 hover:text-muted-foreground transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center space-x-2">
                  {product.sale_price ? (
                    <>
                      <span className="font-semibold text-brand-black">
                        {formatPrice(product.sale_price)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-brand-black">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
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