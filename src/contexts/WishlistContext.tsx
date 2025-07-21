
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRobustWishlist } from '@/hooks/useRobustWishlist';

interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
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
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  loading: boolean;
  authInitialized: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const { robustWishlistFetch, robustWishlistAdd, robustWishlistRemove } = useRobustWishlist();

  // Debounced auth state tracking
  useEffect(() => {
    let mounted = true;
    let authTimeout: NodeJS.Timeout;

    const handleAuthChange = (event: string, session: any) => {
      if (!mounted) return;
      
      // Clear any existing timeout
      if (authTimeout) {
        clearTimeout(authTimeout);
      }

      // Debounce auth state changes
      authTimeout = setTimeout(() => {
        if (!mounted) return;
        
        console.log('Wishlist Auth state change:', event, session?.user?.id);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setWishlistItems([]);
          setLoading(false);
        }
        
        if (!authInitialized) {
          setAuthInitialized(true);
        }
      }, 100);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthInitialized(true);
    });

    return () => {
      mounted = false;
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  // Load wishlist when auth is ready
  useEffect(() => {
    if (authInitialized && user) {
      refreshWishlist();
    } else if (authInitialized && !user) {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [authInitialized, user]);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await robustWishlistFetch(user.id);
      
      // Transform data to match our interface
      const transformedItems: WishlistItem[] = data.map(item => ({
        ...item,
        product: item.products ? {
          id: item.products.id,
          name: item.products.name,
          slug: item.products.slug,
          price: item.products.price,
          sale_price: item.products.sale_price,
          product_images: item.products.product_images || []
        } : undefined
      }));

      setWishlistItems(transformedItems);
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
      // Don't show error toast here - the robust hook handles it
    } finally {
      setLoading(false);
    }
  }, [user, robustWishlistFetch]);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistItems.some(item => item.product_id === productId);
  }, [wishlistItems]);

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    if (isInWishlist(productId)) {
      return;
    }

    try {
      await robustWishlistAdd(productId, user.id);
      await refreshWishlist();
      
      toast({
        title: "Added to wishlist!",
        description: "Item added to your wishlist successfully",
      });
    } catch (error) {
      // Error handling is done in the robust hook
      console.error('Error in addToWishlist:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      await robustWishlistRemove(productId, user.id);
      await refreshWishlist();
      
      toast({
        title: "Removed from wishlist",
        description: "Item removed from your wishlist",
      });
    } catch (error) {
      // Error handling is done in the robust hook
      console.error('Error in removeFromWishlist:', error);
    }
  };

  const value: WishlistContextType = {
    wishlistItems,
    loading,
    authInitialized,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    refreshWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
