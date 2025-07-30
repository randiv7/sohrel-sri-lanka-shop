import { supabase } from "@/integrations/supabase/client";

// Generate cryptographically secure session tokens
export const generateSecureSessionId = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Validate session token format
export const isValidSessionToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  // Check if token is at least 32 characters and uses safe characters
  return /^[A-Za-z0-9_-]{32,}$/.test(token);
};

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (basic Sri Lankan format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+94|0)[1-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Secure guest session management
export const createGuestSession = async (): Promise<string> => {
  const token = generateSecureSessionId();
  
  try {
    const { error } = await supabase.functions.invoke('guest-session-manager', {
      body: { action: 'create', token }
    });
    
    if (error) {
      console.warn('Failed to create secure guest session:', error);
      return token; // Fallback to client-side only
    }
    
    return token;
  } catch (error) {
    console.warn('Guest session service unavailable:', error);
    return token; // Fallback to client-side only
  }
};

// Validate guest session
export const validateGuestSession = async (token: string): Promise<boolean> => {
  if (!isValidSessionToken(token)) return false;
  
  try {
    const { data, error } = await supabase.functions.invoke('guest-session-manager', {
      body: { action: 'validate', token }
    });
    
    if (error) {
      console.warn('Failed to validate guest session:', error);
      return true; // Fallback to allow operation
    }
    
    return data?.valid || false;
  } catch (error) {
    console.warn('Guest session validation unavailable:', error);
    return true; // Fallback to allow operation
  }
};

// Rate limiting helper
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

// Input validation helpers
export const validateProductName = (name: string): string | null => {
  if (!name || name.trim().length < 2) {
    return "Product name must be at least 2 characters long";
  }
  if (name.length > 200) {
    return "Product name must be less than 200 characters";
  }
  if (/<script|javascript:|on\w+=/i.test(name)) {
    return "Product name contains invalid characters";
  }
  return null;
};

export const validatePrice = (price: number | string): string | null => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice) || numPrice < 0) {
    return "Price must be a valid positive number";
  }
  if (numPrice > 1000000) {
    return "Price cannot exceed 1,000,000";
  }
  return null;
};

export const validateImageUrl = (url: string): string | null => {
  if (!url) return null; // Allow empty URLs
  
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return "Image URL must use HTTP or HTTPS protocol";
    }
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname)) {
      return "Image URL must point to a valid image file";
    }
    return null;
  } catch {
    return "Invalid image URL format";
  }
};

// Admin audit logging
export const logAdminAction = async (action: string, details: any = {}) => {
  try {
    await supabase.from('admin_audit_log').insert({
      admin_user_id: (await supabase.auth.getUser()).data.user?.id,
      action,
      details,
      ip_address: null, // Will be set by database trigger if available
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.warn('Failed to log admin action:', error);
  }
};