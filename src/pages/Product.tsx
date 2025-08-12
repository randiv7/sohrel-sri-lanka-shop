import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import RelatedProducts from "@/components/RelatedProducts";

interface ProductVariant {
  id: number;
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  sku?: string;
}

interface ProductImage {
  image_url: string;
  alt_text: string;
  is_primary: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  sale_price?: number;
  is_featured: boolean;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  categories?: {
    id: number;
    name: string;
    slug: string;
  };
  category_id?: number;
}

const Product = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (product) {
      // Track product view
      trackEvent({
        event_type: 'product_view',
        event_data: {
          product_id: product.id,
          product_name: product.name,
          category: product.categories?.name,
          price: product.sale_price || product.price
        }
      });
    }
  }, [product, trackEvent]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          product_variants(*),
          categories(id, name, slug)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Product not found",
          description: "The product you're looking for doesn't exist or has been removed.",
          variant: "destructive",
        });
        return;
      }

      setProduct(data);
      
      // Set default variant if available
      if (data.product_variants && data.product_variants.length > 0) {
        setSelectedVariant(data.product_variants[0]);
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load product details.",
        variant: "destructive",
      });
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

  const getProductImages = () => {
    if (!product?.product_images || product.product_images.length === 0) {
      return [{ image_url: '/placeholder.svg', alt_text: product?.name || 'Product', is_primary: true }];
    }
    
    // Sort images so primary comes first
    return [...product.product_images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return 0;
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product.id, selectedVariant?.id || null, quantity);
      
      // Track add to cart event
      trackEvent({
        event_type: 'add_to_cart',
        event_data: {
          product_id: product.id,
          product_name: product.name,
          variant_id: selectedVariant?.id,
          quantity: quantity,
          price: selectedVariant?.price || product.sale_price || product.price
        }
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    try {
      if (isInWishlist(product.id.toString())) {
        await removeFromWishlist(product.id.toString());
      } else {
        await addToWishlist(product.id.toString());
        
        // Track wishlist add event
        trackEvent({
          event_type: 'add_to_wishlist',
          event_data: {
            product_id: product.id,
            product_name: product.name,
            price: product.sale_price || product.price
          }
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.short_description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Product link has been copied to clipboard.",
        });
      }
      
      // Track share event
      trackEvent({
        event_type: 'share_product',
        event_data: {
          product_id: product.id,
          product_name: product.name
        }
      });
      
    } catch (error) {
      console.error('Error sharing:', error);
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/shop">
                Browse Products
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = getProductImages();
  const currentPrice = selectedVariant?.price || product.sale_price || product.price;
  const originalPrice = selectedVariant?.price || product.price;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${product.categories.slug}`} className="hover:text-foreground">
                {product.categories.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/shop">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={images[selectedImage]?.image_url}
                alt={images[selectedImage]?.alt_text || product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "aspect-square overflow-hidden rounded-md border-2 transition-colors",
                      selectedImage === index ? "border-primary" : "border-transparent"
                    )}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                )}
                {product.categories && (
                  <Badge variant="outline">{product.categories.name}</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-3 mb-4">
                {product.sale_price && !selectedVariant ? (
                  <>
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.sale_price)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                    <Badge variant="destructive" className="ml-2">
                      Save {Math.round((1 - product.sale_price / product.price) * 100)}%
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(currentPrice)}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.short_description}
              </p>
            </div>

            {/* Variants */}
            {product.product_variants && product.product_variants.length > 0 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Size & Color</Label>
                  <Select 
                    value={selectedVariant?.id?.toString() || ""} 
                    onValueChange={(value) => {
                      const variant = product.product_variants.find(v => v.id === parseInt(value));
                      setSelectedVariant(variant || null);
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select size and color" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.product_variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id.toString()}>
                          {variant.size} - {variant.color} 
                          {variant.price !== product.price && (
                            <span className="ml-2 font-medium">
                              ({formatPrice(variant.price)})
                            </span>
                          )}
                          {variant.stock_quantity <= 0 && (
                            <span className="ml-2 text-red-500">(Out of Stock)</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedVariant && (
                  <div className="text-sm text-muted-foreground">
                    <p>SKU: {selectedVariant.sku}</p>
                    <p className={selectedVariant.stock_quantity <= 5 ? "text-red-600" : ""}>
                      {selectedVariant.stock_quantity > 0 
                        ? `${selectedVariant.stock_quantity} in stock`
                        : "Out of stock"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label className="text-sm font-medium">Quantity</Label>
              <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                <SelectTrigger className="w-20 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1"
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleWishlistToggle}
                className={cn(
                  "transition-colors duration-200",
                  isInWishlist(product.id.toString()) && "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                )}
              >
                <Heart className={cn(
                  "w-4 h-4 transition-all duration-200",
                  isInWishlist(product.id.toString()) && "fill-current text-red-600"
                )} />
              </Button>
              
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Product Info */}
            <div className="text-sm text-muted-foreground space-y-1">
              {product.categories && (
                <p>Category: {product.categories.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-16">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-3">Product Details</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Related Products */}
        <RelatedProducts 
          currentProductId={product.id} 
          categoryId={product.category_id || product.categories?.id} 
        />
      </main>

      <Footer />
    </div>
  );
};

export default Product;