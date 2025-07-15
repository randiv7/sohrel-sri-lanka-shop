import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react";
import RelatedProducts from "@/components/RelatedProducts";

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  sku: string;
}

interface ProductImage {
  image_url: string;
  alt_text: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  sale_price?: number;
  sku: string;
  is_featured: boolean;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
  category_id?: string;
}

const Product = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, alt_text, is_primary),
          product_variants(*),
          categories(id, name, slug)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return;
      }

      setProduct(data);
      
      // Set first variant as selected
      if (data.product_variants?.length > 0) {
        setSelectedVariant(data.product_variants[0]);
      }

      // Set primary image or first image as selected
      const primaryImage = data.product_images?.find(img => img.is_primary);
      if (primaryImage) {
        setSelectedImage(primaryImage.image_url);
      } else if (data.product_images?.length > 0) {
        setSelectedImage(data.product_images[0].image_url);
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

  const getAvailableSizes = () => {
    return [...new Set(product?.product_variants?.map(v => v.size))];
  };

  const getAvailableColors = () => {
    return [...new Set(product?.product_variants?.map(v => v.color))];
  };

  const handleSizeChange = (size: string) => {
    const variant = product?.product_variants?.find(v => v.size === size);
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({
        title: "Please select a size",
        description: "You need to select a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    if (!product) {
      toast({
        title: "Error",
        description: "Product not found.",
        variant: "destructive",
      });
      return;
    }

    await addToCart(product.id, selectedVariant.id, quantity);
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
            <h1 className="text-3xl font-bold text-foreground mb-4">Product not found</h1>
            <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
            <Link to="/shop">
              <Button>Back to Shop</Button>
            </Link>
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
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
        <Link to="/shop">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </Link>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src={selectedImage || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.product_images && product.product_images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.product_images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image.image_url)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === image.image_url ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.is_featured && (
                <Badge className="mb-2">Featured</Badge>
              )}
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.short_description}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              {product.sale_price ? (
                <>
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="destructive">
                    Save {formatPrice(product.price - product.sale_price)}
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Size: {selectedVariant?.size && <span className="font-normal">({selectedVariant.size})</span>}
                </label>
                <Select onValueChange={handleSizeChange} value={selectedVariant?.size}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSizes().map((size) => {
                      const variant = product.product_variants?.find(v => v.size === size);
                      const inStock = variant && variant.stock_quantity > 0;
                      return (
                        <SelectItem 
                          key={size} 
                          value={size}
                          disabled={!inStock}
                        >
                          {size} {!inStock && '(Out of Stock)'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedVariant && (
                <div className="text-sm text-muted-foreground">
                  <p>Stock: {selectedVariant.stock_quantity} available</p>
                  <p>SKU: {selectedVariant.sku}</p>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
                <Select value={quantity.toString()} onValueChange={(val) => setQuantity(parseInt(val))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1"
                  disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Product Details</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          </div>
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