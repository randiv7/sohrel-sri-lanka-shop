import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { cartItems, cartCount, loading, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getItemTotal = (item: typeof cartItems[0]) => {
    const price = item.product_variant?.price || item.product?.sale_price || item.product?.price || 0;
    return price * item.quantity;
  };

  const getItemPrice = (item: typeof cartItems[0]) => {
    return item.product_variant?.price || item.product?.sale_price || item.product?.price || 0;
  };

  const getItemImage = (item: typeof cartItems[0]) => {
    const primaryImage = item.product?.product_images?.find(img => img.is_primary);
    return primaryImage?.image_url || item.product?.product_images?.[0]?.image_url || '/placeholder.svg';
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. 
              Start shopping to fill it up!
            </p>
            <Link to="/shop">
              <Button size="lg">
                Continue Shopping
              </Button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={getItemImage(item)}
                      alt={item.product?.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link 
                            to={`/product/${item.product?.slug}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {item.product?.name || 'Unknown Product'}
                          </Link>
                          <div className="flex gap-2 mt-1">
                            {item.product_variant?.size && (
                              <Badge variant="outline">{item.product_variant.size}</Badge>
                            )}
                            {item.product_variant?.color && (
                              <Badge variant="outline">{item.product_variant.color}</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {item.product?.sale_price && item.product?.sale_price < item.product?.price ? (
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
                              {formatPrice(getItemPrice(item))}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              if (newQuantity > 0) {
                                updateQuantity(item.id, newQuantity);
                              }
                            }}
                            className="w-16 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.product_variant ? item.quantity >= item.product_variant.stock_quantity : false}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 text-right">
                        <span className="font-semibold text-foreground">
                          Total: {formatPrice(getItemTotal(item))}
                        </span>
                      </div>
                      
                      {item.product_variant && (
                        <div className="mt-1 text-sm text-muted-foreground text-right">
                          {item.product_variant.stock_quantity} available
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-xl text-foreground">
                        {formatPrice(getCartTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to="/checkout">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link to="/shop">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground">
                    Free shipping on orders over LKR 5,000 within Colombo
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;