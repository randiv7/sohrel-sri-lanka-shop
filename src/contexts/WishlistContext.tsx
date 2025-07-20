
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Track auth state with proper initialization
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Wishlist Auth state change:', event, session?.user?.id);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer wishlist refresh to prevent race conditions
          setTimeout(() => {
            if (mounted) {
              refreshWishlist();
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          // Clear wishlist on logout
          setWishlistItems([]);
          setLoading(false);
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

  // Initial wishlist load after auth is initialized
  useEffect(() => {
    if (authInitialized && !refreshing) {
      if (user) {
        refreshWishlist();
      } else {
        setWishlistItems([]);
        setLoading(false);
      }
    }
  }, [authInitialized, user]);

  const refreshWishlist = useCallback(async () => {
    if (!user || refreshing) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('wishlists')
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
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
        return;
      }

      // Transform data to match our interface
      const transformedItems: WishlistItem[] = (data || []).map(item => ({
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
      toast({
        title: "Error",
        description: "Failed to load wishlist items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing, toast]);

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
      const { error } = await supabase
        .from('wishlists')
        .insert([{
          product_id: productId,
          user_id: user.id
        }]);

      if (error) {
        console.error('Error adding to wishlist:', error);
        toast({
          title: "Error",
          description: "Failed to add item to wishlist",
          variant: "destructive",
        });
        return;
      }

      await refreshWishlist();
      
      toast({
        title: "Added to wishlist!",
        description: "Item added to your wishlist successfully",
      });
    } catch (error) {
      console.error('Error in addToWishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing from wishlist:', error);
        toast({
          title: "Error",
          description: "Failed to remove item from wishlist",
          variant: "destructive",
        });
        return;
      }

      await refreshWishlist();
      
      toast({
        title: "Removed from wishlist",
        description: "Item removed from your wishlist",
      });
    } catch (error) {
      console.error('Error in removeFromWishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
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
