import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { SimpleImage } from "@/components/SimpleImage";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  short_description?: string;
  is_featured?: boolean;
  product_images?: Array<{
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
  }>;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [secondaryImageLoaded, setSecondaryImageLoaded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProductImages = (product: Product) => {
    const images = product.product_images || [];
    const primaryImage = images.find(img => img.is_primary) || images[0];
    const secondaryImage = images.find(img => !img.is_primary) || images[1];
    
    return {
      primary: primaryImage?.image_url || '/placeholder.svg',
      secondary: secondaryImage?.image_url || primaryImage?.image_url || '/placeholder.svg',
      primaryAlt: primaryImage?.alt_text || product.name,
      secondaryAlt: secondaryImage?.alt_text || product.name,
      hasMultipleImages: images.length > 1
    };
  };

  const productImages = getProductImages(product);

  // Preload secondary image
  useEffect(() => {
    if (productImages.hasMultipleImages && productImages.secondary !== productImages.primary) {
      const img = new Image();
      img.onload = () => setSecondaryImageLoaded(true);
      img.onerror = () => setSecondaryImageLoaded(false);
      img.src = productImages.secondary;
    }
  }, [productImages.secondary, productImages.primary, productImages.hasMultipleImages]);

  // Check if touch device
  const isTouchDevice = useCallback(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const shouldShowHoverEffect = !isTouchDevice() && 
    productImages.hasMultipleImages && 
    secondaryImageLoaded &&
    productImages.secondary !== productImages.primary;

  const handleMouseEnter = () => {
    if (shouldShowHoverEffect) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (shouldShowHoverEffect) {
      setIsHovered(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, null, 1);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const currentImage = isHovered ? productImages.secondary : productImages.primary;
  const currentAlt = isHovered ? productImages.secondaryAlt : productImages.primaryAlt;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className={cn("bg-white rounded-lg shadow-sm overflow-hidden group", className)}>
      <div 
        className="relative aspect-[4/5] overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <SimpleImage
            src={currentImage}
            alt={currentAlt}
            className="w-full h-full object-cover transition-all duration-[800ms] ease-out group-hover:scale-105"
          />
        </Link>
        
        {product.sale_price && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1">
            SALE
          </Badge>
        )}
        
        {product.is_featured && (
          <Badge className="absolute top-3 right-3 bg-black text-white text-xs px-2 py-1">
            FEATURED
          </Badge>
        )}

        {/* Subtle hover overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-[400ms] flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] flex gap-2">
            <Button 
              size="sm" 
              className="bg-white text-black hover:bg-black hover:text-white shadow-lg transition-colors duration-[250ms]"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className={cn(
                "bg-white border-white hover:bg-black hover:text-white shadow-lg transition-colors duration-[250ms]",
                inWishlist && "bg-red-500 text-white border-red-500"
              )}
              onClick={handleWishlistToggle}
            >
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* Image indicator dots */}
        {productImages.hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors duration-[600ms]",
              !isHovered ? "bg-white" : "bg-white/50"
            )} />
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors duration-[600ms]",
              isHovered ? "bg-white" : "bg-white/50"
            )} />
          </div>
        )}
      </div>

      <div className="p-3">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-medium text-sm uppercase tracking-wider mb-1 hover:text-muted-foreground transition-colors duration-[250ms]">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center space-x-2">
          {product.sale_price ? (
            <>
              <span className="font-semibold text-red-600">
                {formatPrice(product.sale_price)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;