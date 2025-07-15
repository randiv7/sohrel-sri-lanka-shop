import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  short_description: string;
  is_featured: boolean;
  product_images: Array<{
    image_url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
  categories?: {
    name: string;
    slug: string;
  };
}

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
}

const RelatedProducts = ({ currentProductId, categoryId }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  const fetchRelatedProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, alt_text, is_primary),
          categories(name, slug)
        `)
        .eq('is_active', true)
        .neq('id', currentProductId)
        .limit(4);

      // If we have a category, prioritize products from the same category
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching related products:', error);
        return;
      }

      // If we have less than 4 products from the same category, fetch more from other categories
      if (data && data.length < 4) {
        const remainingCount = 4 - data.length;
        const { data: moreProducts, error: moreError } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, alt_text, is_primary),
            categories(name, slug)
          `)
          .eq('is_active', true)
          .neq('id', currentProductId)
          .not('category_id', 'eq', categoryId)
          .limit(remainingCount);

        if (moreError) {
          console.error('Error fetching additional products:', moreError);
        } else {
          setProducts([...data, ...(moreProducts || [])]);
        }
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProductImage = (product: Product): string => {
    const primaryImage = product.product_images?.find(img => img.is_primary);
    return primaryImage?.image_url || '/placeholder.svg';
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
          You Might Also Like
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.slug}`}>
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2">Featured</Badge>
                    )}
                    {product.sale_price && (
                      <Badge variant="destructive" className="absolute top-2 right-2">
                        Sale
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {product.short_description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product.sale_price ? (
                          <>
                            <span className="font-bold text-primary">
                              {formatPrice(product.sale_price)}
                            </span>
                            <span className="text-muted-foreground line-through text-sm">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-foreground">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      
                      {product.categories && (
                        <Badge variant="outline" className="text-xs">
                          {product.categories.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;