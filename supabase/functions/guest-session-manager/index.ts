import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, token } = await req.json();

    if (action === 'create') {
      // Create a new guest session
      // Handle complex IP address from multiple proxies
      const forwardedFor = req.headers.get('x-forwarded-for');
      let ipAddress = null;
      
      if (forwardedFor) {
        // Take the first IP from comma-separated list
        const firstIp = forwardedFor.split(',')[0].trim();
        ipAddress = firstIp;
      }

      const { error } = await supabase
        .from('guest_sessions')
        .insert({
          session_token: token,
          ip_address: ipAddress,
          user_agent: req.headers.get('user-agent')
        });

      if (error) {
        console.error('Failed to create guest session:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'validate') {
      // Validate and refresh session
      const { data: isValid } = await supabase
        .rpc('validate_guest_session', { token });

      return new Response(
        JSON.stringify({ valid: isValid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Guest session manager error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});