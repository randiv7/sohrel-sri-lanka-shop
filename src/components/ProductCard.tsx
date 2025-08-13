import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { SimpleImage } from "@/components/SimpleImage";
import { cn } from "@/lib/utils";
import { Product } from "@/types/global";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInWishlist(String(product.id)));
  }, [product.id, isInWishlist]);

  const handleAddToCart = useCallback(async () => {
    try {
      await addToCart(product.id, null, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  }, [addToCart, product.id]);

  const handleWishlistToggle = useCallback(async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(String(product.id));
      } else {
        await addToWishlist(String(product.id));
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  }, [isWishlisted, removeFromWishlist, addToWishlist, product.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProductImageUrl = () => {
    const primaryImage = product.product_images?.find(img => img.is_primary);
    return primaryImage?.image_url || product.product_images?.[0]?.image_url || '/placeholder.svg';
  };

  const discountPercentage = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div className={cn(
      "group relative bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20",
      className
    )}>
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors duration-200"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart 
          className={cn(
            "h-4 w-4 transition-colors duration-200",
            isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
          )} 
        />
      </button>

      {/* Sale Badge */}
      {product.sale_price && (
        <Badge 
          variant="destructive" 
          className="absolute top-2 left-2 z-10 text-xs font-bold"
        >
          -{discountPercentage}%
        </Badge>
      )}

      {/* Featured Badge */}
      {product.is_featured && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 z-10 text-xs"
          style={{ marginTop: product.sale_price ? '28px' : '0' }}
        >
          Featured
        </Badge>
      )}

      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden aspect-[4/5]">
          <SimpleImage
            src={getProductImageUrl()}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Category */}
        {product.categories && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.categories.name}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          {product.sale_price ? (
            <>
              <span className="font-bold text-primary text-lg">
                {formatPrice(product.sale_price)}
              </span>
              <span className="text-muted-foreground line-through text-sm">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="font-bold text-foreground text-lg">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Description */}
        {product.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Add to Cart Button */}
        <Button 
          onClick={handleAddToCart}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;