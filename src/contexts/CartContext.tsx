import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  product_variant_id: string | null;
  quantity: number;
  session_id: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  // Populated fields
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    product_images: Array<{
      image_url: string;
      alt_text?: string;
      is_primary: boolean;
    }>;
  };
  product_variant?: {
    id: string;
    size: string;
    color?: string;
    price?: number;
    stock_quantity: number;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  authInitialized: boolean;
  addToCart: (productId: string, variantId: string | null, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Generate a session ID for guest users
const getSessionId = () => {
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

// Backup cart to sessionStorage
const backupCartToSession = (items: CartItem[]) => {
  try {
    sessionStorage.setItem('cart_backup', JSON.stringify(items));
  } catch (error) {
    console.error('Failed to backup cart:', error);
  }
};

// Restore cart from sessionStorage
const restoreCartFromSession = (): CartItem[] => {
  try {
    const backup = sessionStorage.getItem('cart_backup');
    return backup ? JSON.parse(backup) : [];
  } catch (error) {
    console.error('Failed to restore cart backup:', error);
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Track auth state with proper initialization
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        setUser(session?.user ?? null);
        
        // Don't clear cart immediately on auth change
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer cart refresh to prevent race conditions
          setTimeout(() => {
            if (mounted) {
              refreshCart();
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          // Keep guest cart but refresh to ensure proper session handling
          setTimeout(() => {
            if (mounted) {
              refreshCart();
            }
          }, 100);
        }
        
        if (!authInitialized) {
          setAuthInitialized(true);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthInitialized(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Initial cart load after auth is initialized
  useEffect(() => {
    if (authInitialized && !refreshing) {
      refreshCart();
    }
  }, [authInitialized]);

  const refreshCart = useCallback(async () => {
    if (refreshing) return; // Prevent concurrent refreshes
    
    try {
      setRefreshing(true);
      setLoading(true);
      
      let query = supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            slug,
            price,
            sale_price,
            product_images (
              image_url,
              alt_text,
              is_primary
            )
          ),
          product_variants (
            id,
            size,
            color,
            price,
            stock_quantity
          )
        `);

      if (user) {
        // Authenticated user
        query = query.eq('user_id', user.id);
      } else {
        // Guest user
        const sessionId = getSessionId();
        query = query.eq('session_id', sessionId).is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cart:', error);
        // Try to restore from backup on error
        const backup = restoreCartFromSession();
        if (backup.length > 0) {
          setCartItems(backup);
        }
        return;
      }

      // Transform data to match our interface
      const transformedItems: CartItem[] = (data || []).map(item => ({
        ...item,
        product: item.products ? {
          id: item.products.id,
          name: item.products.name,
          slug: item.products.slug,
          price: item.products.price,
          sale_price: item.products.sale_price,
          product_images: item.products.product_images || []
        } : undefined,
        product_variant: item.product_variants || undefined
      }));

      setCartItems(transformedItems);
      // Backup to session storage
      backupCartToSession(transformedItems);
    } catch (error) {
      console.error('Error refreshing cart:', error);
      // Try to restore from backup on error
      const backup = restoreCartFromSession();
      if (backup.length > 0) {
        setCartItems(backup);
      }
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing, toast]);

  const addToCart = async (productId: string, variantId: string | null, quantity: number = 1) => {
    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => 
        item.product_id === productId && item.product_variant_id === variantId
      );

      if (existingItem) {
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      // Add new item
      const insertData: any = {
        product_id: productId,
        product_variant_id: variantId,
        quantity
      };

      if (user) {
        insertData.user_id = user.id;
      } else {
        insertData.session_id = getSessionId();
      }

      const { error } = await supabase
        .from('cart_items')
        .insert([insertData]);

      if (error) {
        console.error('Error adding to cart:', error);
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
        return;
      }

      await refreshCart();
      
      toast({
        title: "Added to cart!",
        description: "Item added to your cart successfully",
      });
    } catch (error) {
      console.error('Error in addToCart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating quantity:', error);
        toast({
          title: "Error",
          description: "Failed to update quantity",
          variant: "destructive",
        });
        return;
      }

      await refreshCart();
    } catch (error) {
      console.error('Error in updateQuantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing from cart:', error);
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive",
        });
        return;
      }

      await refreshCart();
      
      toast({
        title: "Removed from cart",
        description: "Item removed from your cart",
      });
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      let query = supabase.from('cart_items').delete();

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        const sessionId = getSessionId();
        query = query.eq('session_id', sessionId).is('user_id', null);
      }

      const { error } = await query;

      if (error) {
        console.error('Error clearing cart:', error);
        return;
      }

      setCartItems([]);
      // Clear backup as well
      sessionStorage.removeItem('cart_backup');
    } catch (error) {
      console.error('Error in clearCart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product_variant?.price || item.product?.sale_price || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value: CartContextType = {
    cartItems,
    cartCount,
    loading,
    authInitialized,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
