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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const min_price = searchParams.get("min_price");
    const max_price = searchParams.get("max_price");
    const sort = searchParams.get("sort") || "relevance";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    console.log(`Product search: "${query}" with filters`);

    let searchQuery = supabase.from("product_search").select(`
      id,
      name,
      description,
      short_description,
      sku,
      price,
      sale_price,
      is_active,
      is_featured,
      tags,
      category_name,
      subcategory_name
    `);

    // Full-text search if query provided
    if (query.trim()) {
      const searchTerms = query.trim().split(/\s+/).join(" & ");
      searchQuery = searchQuery.or(`search_vector.fts.${searchTerms}`);
    }

    // Category filter
    if (category) {
      searchQuery = searchQuery.eq("category_name", category);
    }

    // Price filters
    if (min_price) {
      searchQuery = searchQuery.gte("price", parseFloat(min_price));
    }
    if (max_price) {
      searchQuery = searchQuery.lte("price", parseFloat(max_price));
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        searchQuery = searchQuery.order("price", { ascending: true });
        break;
      case "price_desc":
        searchQuery = searchQuery.order("price", { ascending: false });
        break;
      case "name":
        searchQuery = searchQuery.order("name", { ascending: true });
        break;
      case "featured":
        searchQuery = searchQuery.order("is_featured", { ascending: false });
        break;
      default:
        // Relevance - for text search, PostgreSQL handles ranking
        if (query.trim()) {
          searchQuery = searchQuery.order("is_featured", { ascending: false });
        } else {
          searchQuery = searchQuery.order("name", { ascending: true });
        }
    }

    // Pagination
    searchQuery = searchQuery.range(offset, offset + limit - 1);

    const { data: products, error } = await searchQuery;

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    // Get total count for pagination (simplified)
    let totalCount = products?.length || 0;
    
    // Record search analytics
    const searchEvent = {
      query,
      category,
      min_price,
      max_price,
      sort,
      results_count: totalCount,
    };

    // Fire and forget analytics
    try {
      await supabase.from("analytics_events").insert({
        event_type: "product_search",
        event_data: searchEvent,
      });
    } catch (analyticsError) {
      console.warn("Failed to record search analytics:", analyticsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        products: products || [],
        total_count: totalCount,
        query,
        filters: {
          category,
          min_price,
          max_price,
          sort,
        },
        pagination: {
          limit,
          offset,
          has_more: totalCount === limit,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in product search:", error);
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