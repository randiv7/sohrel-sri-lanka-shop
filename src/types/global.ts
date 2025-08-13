// Global type definitions to ensure consistency across the app

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  parent_id?: number;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  base_price?: number;
  stock_quantity?: number;
  category_id: number;
  is_active?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  categories?: Category;
}

export interface ProductImage {
  id: string;
  product_id: number;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order?: number;
  created_at?: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size?: string;
  color?: string;
  price?: number;
  stock_quantity?: number;
  sku?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_variant_id?: number;
  quantity: number;
  user_id?: string;
  session_id?: string;
  product?: Product;
  product_variant?: ProductVariant;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  guest_email?: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount?: number;
  total_amount: number;
  currency?: string;
  shipping_address: any;
  billing_address?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_variant_id: number;
  quantity: number;
  price: number;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: number;
  created_at: string;
  products?: Product;
}