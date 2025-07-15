import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CODOrderRequest {
  orderId: string;
  province: string;
  deliveryPreference?: string;
  specialInstructions?: string;
  customerAvailability?: any;
  verificationMethod?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId, province, deliveryPreference, specialInstructions, customerAvailability, verificationMethod = 'phone_call' }: CODOrderRequest = await req.json();

    console.log('Processing COD order:', { orderId, province });

    // 1. Get the order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 2. Calculate COD fee based on province and order amount
    const { data: feeConfig, error: feeError } = await supabaseClient
      .from('cod_fees_config')
      .select('*')
      .eq('province', province)
      .eq('is_active', true)
      .lte('min_order_amount', order.total_amount)
      .or(`max_order_amount.is.null,max_order_amount.gte.${order.total_amount}`)
      .order('priority', { ascending: true })
      .limit(1)
      .single();

    let codFee = 0;
    if (feeConfig) {
      if (feeConfig.fee_type === 'fixed') {
        codFee = feeConfig.fee_value;
      } else if (feeConfig.fee_type === 'percentage') {
        codFee = (order.total_amount * feeConfig.fee_value) / 100;
        if (feeConfig.max_fee_amount && codFee > feeConfig.max_fee_amount) {
          codFee = feeConfig.max_fee_amount;
        }
      }
    }

    console.log('Calculated COD fee:', codFee);

    // 3. Determine if high value order (above 25,000 LKR)
    const isHighValue = order.total_amount > 25000;

    // 4. Create COD order record
    const { data: codOrder, error: codOrderError } = await supabaseClient
      .from('cod_orders')
      .insert({
        order_id: orderId,
        verification_method: verificationMethod,
        verification_status: 'pending',
        delivery_preference: deliveryPreference,
        special_instructions: specialInstructions,
        customer_availability: customerAvailability,
        is_high_value: isHighValue,
        cod_amount: order.total_amount,
        cod_fee: codFee,
        max_verification_attempts: isHighValue ? 5 : 3
      })
      .select()
      .single();

    if (codOrderError) {
      console.error('Error creating COD order:', codOrderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create COD order', details: codOrderError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 5. Update the main order to include COD fee in total if needed
    if (codFee > 0) {
      const { error: updateOrderError } = await supabaseClient
        .from('orders')
        .update({
          total_amount: order.total_amount + codFee,
          shipping_cost: (order.shipping_cost || 0) + codFee
        })
        .eq('id', orderId);

      if (updateOrderError) {
        console.error('Error updating order with COD fee:', updateOrderError);
      }
    }

    // 6. Schedule initial delivery attempt (next business day)
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 1);
    // If it's weekend, schedule for Monday
    if (scheduledDate.getDay() === 0) scheduledDate.setDate(scheduledDate.getDate() + 1); // Sunday -> Monday
    if (scheduledDate.getDay() === 6) scheduledDate.setDate(scheduledDate.getDate() + 2); // Saturday -> Monday

    const { error: deliveryError } = await supabaseClient
      .from('cod_delivery_attempts')
      .insert({
        cod_order_id: codOrder.id,
        attempt_number: 1,
        scheduled_at: scheduledDate.toISOString(),
        status: 'scheduled'
      });

    if (deliveryError) {
      console.error('Error scheduling delivery attempt:', deliveryError);
    }

    console.log('COD order processed successfully:', codOrder.id);

    return new Response(
      JSON.stringify({
        success: true,
        codOrder: codOrder,
        codFee: codFee,
        scheduledDelivery: scheduledDate.toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in cod-order-processor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);