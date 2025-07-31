
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface CartItem {
  id: string;
  product_id: string;
  product_variant_id?: string;
  quantity: number;
  user_id?: string;
  session_id?: string;
  product?: {
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
  };
  product_variant?: {
    id: string;
    size: string;
    color?: string;
    price?: number;
    stock_quantity?: number;
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

const generateSessionId = async (): Promise<string> => {
  // Fast fallback for immediate session creation
  const fallbackToken = 'guest_' + crypto.randomUUID();
  
  try {
    // Try secure session creation with timeout
    const { createGuestSession } = await import('../utils/securityUtils');
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 2000)
    );
    
    return await Promise.race([createGuestSession(), timeoutPromise]);
  } catch (error) {
    console.warn('Using fallback session generation:', error);
    return fallbackToken;
  }
};

const getSessionId = async (): Promise<string> => {
  let sessionId = sessionStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = await generateSessionId();
    sessionStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const { toast } = useToast();

  // Optimized session backup - only when needed
  const backupCartToSession = (items: CartItem[]) => {
    if (!user && items.length > 0) {
      try {
        // Use a more efficient storage method
        const backup = items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          quantity: item.quantity
        }));
        sessionStorage.setItem('cart_backup', JSON.stringify(backup));
      } catch (error) {
        console.warn('Cart backup failed:', error);
      }
    }
  };

  const restoreCartFromSession = (): CartItem[] => {
    if (!user) {
      try {
        const backup = sessionStorage.getItem('cart_backup');
        if (backup) {
          const parsed = JSON.parse(backup);
          sessionStorage.removeItem('cart_backup');
          return Array.isArray(parsed) ? parsed : [];
        }
      } catch (error) {
        console.warn('Cart restore failed:', error);
        sessionStorage.removeItem('cart_backup');
      }
    }
    return [];
  };

  // Initialize cart loading immediately
  useEffect(() => {
    const initializeCart = async () => {
      // Try to load guest cart from session storage immediately
      const guestCartBackup = sessionStorage.getItem('cart_backup');
      if (guestCartBackup) {
        try {
          const parsed = JSON.parse(guestCartBackup);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCartItems(parsed);
          }
        } catch (error) {
          console.warn('Failed to restore guest cart:', error);
          sessionStorage.removeItem('cart_backup');
        }
      }
      
      // Get initial session to determine if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setAuthInitialized(true);
      
      // Load cart from database
      if (session?.user) {
        await refreshCart();
      } else {
        // For guest users, try to load from database with session_id
        await refreshCart();
      }
    };

    initializeCart();
  }, []);

  // Optimized auth state handler
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (event === 'SIGNED_OUT') {
        setCartItems([]);
        sessionStorage.removeItem('cart_backup');
        await refreshCart(); // Load guest cart
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Optimized cart migration
        const guestCart = restoreCartFromSession();
        
        if (guestCart.length > 0) {
          // Bulk insert guest cart items
          const cartInserts = guestCart.map(item => ({
            user_id: session.user.id,
            product_id: item.product_id,
            product_variant_id: item.product_variant_id,
            quantity: item.quantity
          }));

          supabase.from('cart_items')
            .insert(cartInserts)
            .then(() => refreshCart())
            .then(() => {}, err => console.warn('Cart migration failed:', err));
        } else {
          await refreshCart();
        }
      }
      
      setAuthInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshCart = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('cart_items')
        .select(`
          *,
          product:products!inner (
            id, name, slug, price, sale_price, short_description, is_featured,
            product_images (image_url, alt_text, is_primary)
          ),
          product_variant:product_variants (
            id, size, color, price, stock_quantity
          )
        `);

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        // Use a more resilient approach for guest sessions
        try {
          const sessionId = await getSessionId();
          query = query.eq('session_id', sessionId).is('user_id', null);
        } catch (sessionError) {
          console.warn('Session ID generation failed, using empty cart:', sessionError);
          setCartItems([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cart:', error);
        // Don't fail completely, just set empty cart
        setCartItems([]);
        return;
      }

      setCartItems(data || []);
      
      // Optimized backup - only for guest users with items
      if (!user && data && data.length > 0) {
        backupCartToSession(data);
      }
    } catch (error) {
      console.error('Error in refreshCart:', error);
      // Graceful fallback - don't break the app
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, variantId: string | null, quantity: number = 1) => {
    try {
      const sessionId = user ? null : await getSessionId();
      const itemData = {
        product_id: productId,
        product_variant_id: variantId,
        quantity,
        user_id: user?.id || null,
        session_id: sessionId
      };

      const { data, error } = await supabase
        .from('cart_items')
        .insert(itemData)
        .select(`
          *,
          product:products!inner (
            id, name, slug, price, sale_price, short_description, is_featured,
            product_images (image_url, alt_text, is_primary)
          ),
          product_variant:product_variants (
            id, size, color, price, stock_quantity
          )
        `);

      if (error) {
        // Check if item already exists and update quantity instead
        if (error.code === '23505') {
          // Get current item and update quantity
          let getQuery = supabase
            .from('cart_items')
            .select('quantity')
            .eq('product_id', productId);

          if (variantId) {
            getQuery = getQuery.eq('product_variant_id', variantId);
          } else {
            getQuery = getQuery.is('product_variant_id', null);
          }

          if (user) {
            getQuery = getQuery.eq('user_id', user.id);
          } else {
            const sessionId = await getSessionId();
            getQuery = getQuery.eq('session_id', sessionId).is('user_id', null);
          }

          const { data: existingItem } = await getQuery.single();
          
          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            let updateQuery = supabase
              .from('cart_items')
              .update({ quantity: newQuantity })
              .eq('product_id', productId);

            if (variantId) {
              updateQuery = updateQuery.eq('product_variant_id', variantId);
            } else {
              updateQuery = updateQuery.is('product_variant_id', null);
            }

            if (user) {
              updateQuery = updateQuery.eq('user_id', user.id);
            } else {
              const sessionId = await getSessionId();
              updateQuery = updateQuery.eq('session_id', sessionId).is('user_id', null);
            }

            const { error: updateError } = await updateQuery;
            
            if (updateError) {
              throw updateError;
            }
          }
        } else {
          throw error;
        }
      }

      await refreshCart();
      
      toast({
        title: "Added to cart",
        description: "Item added to your cart successfully.",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
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
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;

      await refreshCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
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

      if (error) throw error;

      await refreshCart();
      
      toast({
        title: "Removed from cart",
        description: "Item removed from cart successfully.",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
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
        const sessionId = await getSessionId();
        query = query.eq('session_id', sessionId).is('user_id', null);
      }

      const { error } = await query;

      if (error) throw error;

      setCartItems([]);
      sessionStorage.removeItem('cart_backup');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product_variant?.price || item.product?.sale_price || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
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
    }}>
      {children}
    </CartContext.Provider>
  );
};
