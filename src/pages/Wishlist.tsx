
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { OptimizedImage } from "@/components/OptimizedImage";
import { cn } from "@/lib/utils";

const Wishlist = () => {
  const { wishlistItems, loading, authInitialized, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProductImageUrl = (item: any) => {
    const primaryImage = item.product?.product_images?.find((img: any) => img.is_primary);
    return primaryImage?.image_url || item.product?.product_images?.[0]?.image_url || '/placeholder.svg';
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, null, 1);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  if (!authInitialized || loading) {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold text-foreground">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your saved items ({wishlistItems.length})
          </p>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Start adding items you love to your wishlist
            </p>
            <Button asChild>
              <Link to="/shop">
                Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const WishlistItemImage = () => {
                return (
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Link to={`/product/${item.product?.slug}`}>
                      <OptimizedImage
                        src={getProductImageUrl(item)}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        width={400}
                        height={256}
                      />
                    </Link>
                    
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/90 hover:bg-red-500 hover:text-white"
                        onClick={() => handleRemoveFromWishlist(item.product_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              };

              return (
                <Card key={item.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <WishlistItemImage />
                    
                    <div className="p-4">
                      <Link to={`/product/${item.product?.slug}`}>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {item.product?.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {item.product?.sale_price ? (
                            <>
                              <span className="font-bold text-primary">
                                {formatPrice(item.product.sale_price)}
                              </span>
                              <span className="text-muted-foreground line-through text-sm">
                                {formatPrice(item.product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-foreground">
                              {formatPrice(item.product?.price || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleAddToCart(item.product_id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveFromWishlist(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistItems.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link to="/shop">
                Continue Shopping
              </Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
