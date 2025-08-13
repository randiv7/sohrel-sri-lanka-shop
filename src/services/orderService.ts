
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: number;
  product_id: number;
  product_variant_id?: number;
  quantity: number;
  product?: {
    name: string;
    price: number;
    sale_price?: number;
    product_images?: Array<{
      image_url: string;
    }>;
  };
  product_variant?: {
    size: string;
    color?: string;
  };
}

interface OrderData {
  user_id?: string;
  guest_email?: string;
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  payment_method: string;
  shipping_address: any;
  notes?: string;
  order_number: string;
}

export const createOrderWithItems = async (orderData: OrderData, cartItems: CartItem[]) => {
  // Create order first
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (orderError) throw orderError;

  // Prepare order items for bulk insert - match actual database schema
  const orderItems = cartItems.map(item => {
    const price = item.product?.sale_price || item.product?.price || 0;
    return {
      order_id: parseInt(order.id),
      product_variant_id: item.product_variant_id || null,
      quantity: item.quantity,
      price: price
    };
  });

  // Bulk insert order items
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return { order, orderItems };
};

export const deductInventoryBulk = async (cartItems: CartItem[], orderId: string) => {
  const inventoryItems = cartItems
    .filter(item => item.product_variant_id)
    .map(item => ({
      product_variant_id: item.product_variant_id,
      quantity: item.quantity
    }));

  if (inventoryItems.length === 0) return;

  try {
    await supabase.functions.invoke('inventory-monitor', {
      body: {
        action: 'deduct_stock',
        order_items: inventoryItems,
        order_id: orderId
      }
    });
  } catch (error) {
    console.warn('Inventory deduction failed:', error);
    // Don't fail the order for inventory issues - log and continue
  }
};
