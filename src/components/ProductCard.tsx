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
  id: number;
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
  const [isHovered, setIsHovered] = useState(false);
  const [secondaryImageLoaded, setSecondaryImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Preload secondary image on hover
  useEffect(() => {
    if (isHovered && !secondaryImageLoaded) {
      const productImages = getProductImages(product);
      if (productImages.hasMultipleImages) {
        const img = new Image();
        img.onload = () => setSecondaryImageLoaded(true);
        img.src = productImages.secondary;
      }
    }
  }, [isHovered, secondaryImageLoaded, product]);

  const formatPrice = (price: number): string => {
    return `LKR ${price.toLocaleString()}`;
  };

  const getProductImages = (product: Product) => {
    const images = product.product_images || [];
    const primaryImage = images.find(img => img.is_primary) || images[0];
    const secondaryImage = images.find(img => !img.is_primary) || images[1] || primaryImage;
    
    return {
      primary: primaryImage?.image_url || 'https://placehold.co/400x400/f3f4f6/6b7280?text=Product',
      secondary: secondaryImage?.image_url || primaryImage?.image_url || 'https://placehold.co/400x400/f3f4f6/6b7280?text=Product',
      primaryAlt: primaryImage?.alt_text || product.name,
      secondaryAlt: secondaryImage?.alt_text || product.name,
      hasMultipleImages: images.length > 1
    };
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, null);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id.toString())) {
      await removeFromWishlist(product.id.toString());
    } else {
      await addToWishlist(product.id.toString());
    }
  };

  const productImages = getProductImages(product);
  const currentImage = isHovered ? productImages.secondary : productImages.primary;
  const currentAlt = isHovered ? productImages.secondaryAlt : productImages.primaryAlt;
  const inWishlist = isInWishlist(product.id.toString());

  return (
    <div className={cn("bg-white rounded-lg shadow-sm overflow-hidden group", className)}>
      <Link
        to={`/product/${product.slug}`}
        className="block relative overflow-hidden aspect-square"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SimpleImage
          src={currentImage}
          alt={currentAlt}
          className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
        />
        
        {/* Sale Badge */}
        {product.sale_price && product.sale_price < product.price && (
          <Badge 
            variant="destructive" 
            className="absolute top-3 left-3 z-10 bg-red-600 hover:bg-red-700"
          >
            SALE
          </Badge>
        )}
        
        {/* Featured Badge */}
        {product.is_featured && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 z-10 bg-black text-white hover:bg-gray-800"
          >
            FEATURED
          </Badge>
        )}
        
        {/* Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-black text-white hover:bg-gray-800 text-sm font-medium uppercase tracking-wider"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          
          <Button
            onClick={handleWishlistToggle}
            variant="outline"
            size="sm"
            className={cn(
              "bg-white/90 backdrop-blur-sm border-gray-200 hover:border-gray-300",
              inWishlist && "bg-red-50 border-red-200 text-red-600"
            )}
          >
            <Heart 
              className={cn(
                "w-4 h-4",
                inWishlist && "fill-current"
              )} 
            />
          </Button>
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        <Link 
          to={`/product/${product.slug}`}
          className="block hover:text-gray-600 transition-colors duration-200"
        >
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2">
          {product.sale_price && product.sale_price < product.price ? (
            <>
              <span className="text-lg font-semibold text-red-600">
                {formatPrice(product.sale_price)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        
        {product.short_description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {product.short_description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;