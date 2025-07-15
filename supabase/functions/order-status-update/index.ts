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
    // Initialize Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { order_id, new_status, notes, admin_user_id } = await req.json();

    console.log(`Updating order ${order_id} to status: ${new_status}`);

    // Get current order details
    const { data: currentOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !currentOrder) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    const previous_status = currentOrder.status;

    // Update order status and timestamps
    const updateData: any = {
      status: new_status,
      updated_at: new Date().toISOString(),
    };

    // Set timestamps based on status
    if (new_status === "shipped" && !currentOrder.shipped_at) {
      updateData.shipped_at = new Date().toISOString();
    } else if (new_status === "delivered" && !currentOrder.delivered_at) {
      updateData.delivered_at = new Date().toISOString();
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", order_id);

    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    // Insert status history record
    const { error: historyError } = await supabaseAdmin
      .from("order_status_history")
      .insert({
        order_id,
        status: new_status,
        previous_status,
        changed_by: admin_user_id,
        notes,
      });

    if (historyError) {
      console.error("Failed to insert status history:", historyError);
      // Don't fail the entire operation for history logging
    }

    // Handle inventory updates for status changes
    if (new_status === "cancelled" && previous_status !== "cancelled") {
      // Restore inventory when order is cancelled
      const { data: orderItems } = await supabaseAdmin
        .from("order_items")
        .select("product_variant_id, quantity")
        .eq("order_id", order_id);

      if (orderItems) {
        for (const item of orderItems) {
          if (item.product_variant_id) {
            // Use the track_inventory_movement function
            await supabaseAdmin.rpc("track_inventory_movement", {
              p_variant_id: item.product_variant_id,
              p_movement_type: "return",
              p_quantity_change: item.quantity,
              p_order_id: order_id,
              p_notes: `Order cancelled - stock restored`,
            });
          }
        }
      }
    }

    console.log(`Order ${order_id} status updated successfully from ${previous_status} to ${new_status}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order status updated successfully",
        order_id,
        previous_status,
        new_status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
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