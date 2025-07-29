
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProductImageUrl = (product: Product) => {
    const primaryImage = product.product_images?.find(img => img.is_primary);
    return primaryImage?.image_url || product.product_images?.[0]?.image_url || '/placeholder.svg';
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

  const imageUrl = getProductImageUrl(product);
  const inWishlist = isInWishlist(product.id);

  return (
    <div className={cn("bg-white rounded-lg shadow-sm overflow-hidden group", className)}>
      <div className="relative w-full h-80 overflow-hidden">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <SimpleImage
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {product.sale_price && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
            SALE
          </Badge>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <Button 
              size="sm" 
              className="bg-white text-black hover:bg-black hover:text-white"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className={cn(
                "bg-white border-white hover:bg-black hover:text-white",
                inWishlist && "bg-red-500 text-white border-red-500"
              )}
              onClick={handleWishlistToggle}
            >
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
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
  );
};

export default ProductCard;
