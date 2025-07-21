
import { supabase } from "@/integrations/supabase/client";

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  sale_price: string;
  sku: string;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  weight: string;
  dimensions: string;
  meta_title: string;
  meta_description: string;
  tags: string;
}

export interface ProductVariant {
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  sku: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validateProductForm = async (
  productData: ProductFormData,
  variants: ProductVariant[]
): Promise<ValidationError[]> => {
  const errors: ValidationError[] = [];

  // Basic required fields
  if (!productData.name.trim()) {
    errors.push({ field: 'name', message: 'Product name is required' });
  } else if (productData.name.length < 2) {
    errors.push({ field: 'name', message: 'Product name must be at least 2 characters long' });
  } else if (productData.name.length > 255) {
    errors.push({ field: 'name', message: 'Product name must be less than 255 characters' });
  }

  // Price validation
  const price = parseFloat(productData.price);
  if (!productData.price || isNaN(price) || price <= 0) {
    errors.push({ field: 'price', message: 'Valid price is required and must be greater than 0' });
  } else if (price > 999999.99) {
    errors.push({ field: 'price', message: 'Price cannot exceed 999,999.99' });
  }

  // Sale price validation
  if (productData.sale_price) {
    const salePrice = parseFloat(productData.sale_price);
    if (isNaN(salePrice) || salePrice < 0) {
      errors.push({ field: 'sale_price', message: 'Sale price must be a valid number' });
    } else if (salePrice >= price) {
      errors.push({ field: 'sale_price', message: 'Sale price must be less than regular price' });
    }
  }

  // SKU validation
  if (productData.sku && productData.sku.length > 100) {
    errors.push({ field: 'sku', message: 'SKU must be less than 100 characters' });
  }

  // Variants validation
  if (variants.length === 0) {
    errors.push({ field: 'variants', message: 'At least one product variant is required' });
  } else {
    variants.forEach((variant, index) => {
      if (!variant.size.trim()) {
        errors.push({ field: `variant_${index}_size`, message: `Variant ${index + 1}: Size is required` });
      }
      
      if (variant.price <= 0) {
        errors.push({ field: `variant_${index}_price`, message: `Variant ${index + 1}: Price must be greater than 0` });
      }
      
      if (variant.stock_quantity < 0) {
        errors.push({ field: `variant_${index}_stock`, message: `Variant ${index + 1}: Stock quantity cannot be negative` });
      }
      
      if (variant.sku && variant.sku.length > 100) {
        errors.push({ field: `variant_${index}_sku`, message: `Variant ${index + 1}: SKU must be less than 100 characters` });
      }
    });

    // Check for duplicate variant combinations
    const variantCombos = new Set();
    variants.forEach((variant, index) => {
      const combo = `${variant.size}-${variant.color || ''}`;
      if (variantCombos.has(combo)) {
        errors.push({ field: `variant_${index}_combination`, message: `Duplicate variant combination: ${variant.size}${variant.color ? ` - ${variant.color}` : ''}` });
      }
      variantCombos.add(combo);
    });
  }

  // Check SKU uniqueness if provided
  if (productData.sku) {
    const { data: existingSku } = await supabase
      .from('products')
      .select('id')
      .eq('sku', productData.sku)
      .maybeSingle();
    
    if (existingSku) {
      errors.push({ field: 'sku', message: 'SKU already exists' });
    }
  }

  // Check variant SKU uniqueness
  const variantSkus = variants.filter(v => v.sku).map(v => v.sku);
  if (variantSkus.length > 0) {
    const { data: existingVariantSkus } = await supabase
      .from('product_variants')
      .select('sku')
      .in('sku', variantSkus);
    
    if (existingVariantSkus && existingVariantSkus.length > 0) {
      const existingSkuSet = new Set(existingVariantSkus.map(item => item.sku));
      variants.forEach((variant, index) => {
        if (variant.sku && existingSkuSet.has(variant.sku)) {
          errors.push({ field: `variant_${index}_sku`, message: `Variant ${index + 1}: SKU already exists` });
        }
      });
    }
  }

  return errors;
};

export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return `Multiple validation errors:\n${errors.map(error => `• ${error.message}`).join('\n')}`;
};
