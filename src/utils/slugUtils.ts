
import { supabase } from "@/integrations/supabase/client";

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

export const checkSlugExists = async (slug: string, excludeId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from('products')
      .select('id')
      .eq('slug', slug);
    
    if (excludeId) {
      query = query.neq('id', parseInt(excludeId));
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error('Error checking slug:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in checkSlugExists:', error);
    return false;
  }
};

export const generateUniqueSlug = async (name: string, excludeId?: string): Promise<string> => {
  const baseSlug = generateSlug(name);
  
  if (!baseSlug) {
    throw new Error('Cannot generate slug from product name');
  }
  
  let slug = baseSlug;
  let counter = 1;
  
  while (await checkSlugExists(slug, excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

export const validateSlug = (slug: string): { isValid: boolean; error?: string } => {
  if (!slug || slug.length < 2) {
    return { isValid: false, error: 'Slug must be at least 2 characters long' };
  }
  
  if (slug.length > 100) {
    return { isValid: false, error: 'Slug must be less than 100 characters' };
  }
  
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { isValid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }
  
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { isValid: false, error: 'Slug cannot start or end with a hyphen' };
  }
  
  if (slug.includes('--')) {
    return { isValid: false, error: 'Slug cannot contain consecutive hyphens' };
  }
  
  return { isValid: true };
};
