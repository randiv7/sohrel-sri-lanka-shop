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
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: { persistSession: false },
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    );

    const { event_type, event_data, session_id } = await req.json();

    // Get user from auth header if available
    const authHeader = req.headers.get("Authorization");
    let user_id = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser();
      user_id = user?.id || null;
    }

    // Get client info
    const user_agent = req.headers.get("User-Agent") || null;
    const forwarded_for = req.headers.get("X-Forwarded-For");
    const real_ip = req.headers.get("X-Real-IP");
    const ip_address = forwarded_for?.split(",")[0] || real_ip || null;

    console.log(`Recording analytics event: ${event_type}`);

    // Insert analytics event
    const { error } = await supabase
      .from("analytics_events")
      .insert({
        event_type,
        event_data,
        user_id,
        session_id,
        ip_address,
        user_agent,
      });

    if (error) {
      throw new Error(`Failed to record analytics event: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Analytics event recorded",
        event_type,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error recording analytics event:", error);
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