
import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000
};

export const useRobustWishlist = () => {
  const { toast } = useToast();
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const requestCache = useRef<Map<string, Promise<any>>>(new Map());

  const calculateDelay = (attempt: number, baseDelay: number, maxDelay: number) => {
    return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  };

  const isNetworkError = (error: any) => {
    return (
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('Network request failed') ||
      error?.name === 'NetworkError' ||
      error?.code === 'NETWORK_ERROR'
    );
  };

  const isCriticalError = (error: any) => {
    return (
      error?.code === 'PGRST116' || // RLS policy violation
      error?.message?.includes('JWT') ||
      error?.message?.includes('authentication') ||
      error?.message?.includes('permission')
    );
  };

  const robustFetch = useCallback(async <T>(
    operation: () => Promise<T>,
    operationKey: string,
    config: RetryConfig = DEFAULT_RETRY_CONFIG,
    silentRetry = true
  ): Promise<T> => {
    // Check if there's already a pending request for this operation
    const existingRequest = requestCache.current.get(operationKey);
    if (existingRequest) {
      return existingRequest;
    }

    const executeWithRetry = async (attempt = 0): Promise<T> => {
      try {
        const result = await operation();
        
        // Clear any existing retry timeout
        const timeoutId = retryTimeouts.current.get(operationKey);
        if (timeoutId) {
          clearTimeout(timeoutId);
          retryTimeouts.current.delete(operationKey);
        }
        
        return result;
      } catch (error) {
        console.log(`Wishlist operation failed (attempt ${attempt + 1}):`, error);

        // If it's a critical error, don't retry
        if (isCriticalError(error)) {
          toast({
            title: "Authentication Error",
            description: "Please sign in to access your wishlist",
            variant: "destructive",
          });
          throw error;
        }

        // If we've exhausted retries or it's not a network error, handle appropriately
        if (attempt >= config.maxRetries || !isNetworkError(error)) {
          if (!silentRetry) {
            toast({
              title: "Wishlist Error",
              description: "Unable to update wishlist. Please try again.",
              variant: "destructive",
            });
          }
          throw error;
        }

        // Calculate delay for next retry
        const delay = calculateDelay(attempt, config.baseDelay, config.maxDelay);
        
        // Schedule retry
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            retryTimeouts.current.delete(operationKey);
            executeWithRetry(attempt + 1).then(resolve).catch(reject);
          }, delay);
          
          retryTimeouts.current.set(operationKey, timeoutId);
        });
      }
    };

    const request = executeWithRetry();
    requestCache.current.set(operationKey, request);
    
    // Clear from cache when complete
    request.finally(() => {
      requestCache.current.delete(operationKey);
    });

    return request;
  }, [toast]);

  const robustWishlistFetch = useCallback(async (userId: string) => {
    return robustFetch(
      async () => {
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
          .eq('user_id', userId);

        if (error) throw error;
        return data || [];
      },
      `wishlist-fetch-${userId}`,
      DEFAULT_RETRY_CONFIG,
      true // Silent retry for fetches
    );
  }, [robustFetch]);

  const robustWishlistAdd = useCallback(async (productId: string, userId: string) => {
    return robustFetch(
      async () => {
        const { error } = await supabase
          .from('wishlists')
          .insert([{
            product_id: parseInt(productId),
            user_id: userId
          }]);

        if (error) throw error;
      },
      `wishlist-add-${productId}`,
      DEFAULT_RETRY_CONFIG,
      false // Show error for user actions
    );
  }, [robustFetch]);

  const robustWishlistRemove = useCallback(async (productId: string, userId: string) => {
    return robustFetch(
      async () => {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('product_id', parseInt(productId))
        .eq('user_id', userId);

        if (error) throw error;
      },
      `wishlist-remove-${productId}`,
      DEFAULT_RETRY_CONFIG,
      false // Show error for user actions
    );
  }, [robustFetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts
      retryTimeouts.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      retryTimeouts.current.clear();
      requestCache.current.clear();
    };
  }, []);

  return {
    robustWishlistFetch,
    robustWishlistAdd,
    robustWishlistRemove
  };
};
