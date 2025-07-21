
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { action, order_id, variant_adjustments, order_items } = await req.json();

    console.log(`Inventory monitor action: ${action}`);

    if (action === "deduct_stock" && order_items && order_items.length > 0) {
      // Bulk deduct stock for order items - optimized for performance
      const movements = [];
      
      for (const item of order_items) {
        if (item.product_variant_id) {
          try {
            await supabaseAdmin.rpc("track_inventory_movement", {
              p_variant_id: item.product_variant_id,
              p_movement_type: "sale",
              p_quantity_change: -item.quantity,
              p_order_id: order_id,
              p_notes: `Stock deducted for order ${order_id}`,
            });
            
            movements.push({
              variant_id: item.product_variant_id,
              quantity: item.quantity,
              status: 'success'
            });
          } catch (error) {
            console.error(`Failed to deduct stock for variant ${item.product_variant_id}:`, error);
            movements.push({
              variant_id: item.product_variant_id,
              quantity: item.quantity,
              status: 'failed',
              error: error.message
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Bulk stock deduction completed",
          order_id,
          movements,
          processed: movements.length
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Legacy support for single order deduction
    if (action === "deduct_stock" && order_id) {
      const { data: orderItems } = await supabaseAdmin
        .from("order_items")
        .select("product_variant_id, quantity")
        .eq("order_id", order_id);

      if (orderItems) {
        for (const item of orderItems) {
          if (item.product_variant_id) {
            await supabaseAdmin.rpc("track_inventory_movement", {
              p_variant_id: item.product_variant_id,
              p_movement_type: "sale",
              p_quantity_change: -item.quantity,
              p_order_id: order_id,
              p_notes: `Stock deducted for order`,
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Stock deducted successfully",
          order_id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (action === "adjust_stock" && variant_adjustments) {
      // Manual stock adjustments - batch processing
      const results = [];
      
      for (const adjustment of variant_adjustments) {
        const { variant_id, quantity_change, notes } = adjustment;
        
        try {
          await supabaseAdmin.rpc("track_inventory_movement", {
            p_variant_id: variant_id,
            p_movement_type: "adjustment",
            p_quantity_change: quantity_change,
            p_notes: notes || "Manual stock adjustment",
          });
          
          results.push({ variant_id, status: 'success' });
        } catch (error) {
          console.error(`Failed to adjust stock for variant ${variant_id}:`, error);
          results.push({ variant_id, status: 'failed', error: error.message });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Stock adjustments completed",
          adjustments: variant_adjustments.length,
          results
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (action === "check_low_stock") {
      // Check for low stock items
      const { data: lowStockItems } = await supabaseAdmin
        .from("product_variants")
        .select(`
          id,
          sku,
          size,
          color,
          stock_quantity,
          low_stock_threshold,
          product_id,
          products!inner(name, sku)
        `)
        .lte("stock_quantity", "low_stock_threshold")
        .gt("low_stock_threshold", 0);

      console.log(`Found ${lowStockItems?.length || 0} low stock items`);

      return new Response(
        JSON.stringify({
          success: true,
          low_stock_items: lowStockItems || [],
          count: lowStockItems?.length || 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    throw new Error("Invalid action specified");

  } catch (error) {
    console.error("Error in inventory monitor:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
