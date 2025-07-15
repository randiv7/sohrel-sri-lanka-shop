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
    // Verify admin access
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: { persistSession: false },
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    // Check if user is admin
    const { data: isAdminResult } = await supabase.rpc("is_admin", { user_uuid: user.id });
    if (!isAdminResult) {
      throw new Error("Admin access required");
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    const period = searchParams.get("period") || "30"; // days
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    
    console.log(`Generating sales report for period: ${period} days`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calculate date range
    let dateFilter = "";
    if (start_date && end_date) {
      dateFilter = `created_at.gte.${start_date},created_at.lte.${end_date}`;
    } else {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));
      dateFilter = `created_at.gte.${daysAgo.toISOString()}`;
    }

    // Get sales summary
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("*")
      .neq("status", "cancelled")
      .order("created_at", { ascending: false });

    // Filter orders by date range
    const filteredOrders = orders?.filter(order => {
      const orderDate = new Date(order.created_at);
      if (start_date && end_date) {
        return orderDate >= new Date(start_date) && orderDate <= new Date(end_date);
      } else {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));
        return orderDate >= daysAgo;
      }
    }) || [];

    // Calculate metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by status
    const ordersByStatus = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by day for trend analysis
    const dailyRevenue = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + parseFloat(order.total_amount.toString());
      return acc;
    }, {} as Record<string, number>);

    // Get top products (need to query order_items)
    const { data: orderItems } = await supabaseAdmin
      .from("order_items")
      .select(`
        product_id,
        quantity,
        total_price,
        product_snapshot
      `)
      .in("order_id", filteredOrders.map(o => o.id));

    const productSales = orderItems?.reduce((acc, item) => {
      const productName = item.product_snapshot?.name || "Unknown Product";
      if (!acc[item.product_id]) {
        acc[item.product_id] = {
          name: productName,
          quantity: 0,
          revenue: 0,
        };
      }
      acc[item.product_id].quantity += item.quantity;
      acc[item.product_id].revenue += parseFloat(item.total_price.toString());
      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number }>) || {};

    // Sort top products by revenue
    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(([id, data]) => ({ product_id: id, ...data }));

    const report = {
      period: start_date && end_date ? `${start_date} to ${end_date}` : `Last ${period} days`,
      summary: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        average_order_value: averageOrderValue,
      },
      orders_by_status: ordersByStatus,
      daily_revenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
        date,
        revenue,
      })),
      top_products: topProducts,
      generated_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        report,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating sales report:", error);
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