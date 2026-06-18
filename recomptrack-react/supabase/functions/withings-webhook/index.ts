// Edge Function: withings-webhook
// This receives push notifications from Withings when new data is available.
// Setup: In Withings developer portal, set your notification URL to this function.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    
    // Withings sends different payloads. Common one has "userid" and "appli"
    const withingsUserId = body.userid;
    const appli = body.appli; // 1 = weight, etc.

    if (!withingsUserId) {
      return new Response("Missing userid", { status: 400 });
    }

    // Find our internal user who has this Withings account connected
    // In production you would store the Withings userid in withings_tokens table
    const { data: tokenRow } = await supabase
      .from("withings_tokens")
      .select("user_id")
      .eq("withings_user_id", withingsUserId) // Add this column if using webhooks
      .single();

    if (!tokenRow) {
      console.log("No matching user for Withings ID:", withingsUserId);
      return new Response("OK", { status: 200 }); // Always return 200 to Withings
    }

    // Trigger the sync function for this user
    await supabase.functions.invoke("withings-sync", {
      body: { user_id: tokenRow.user_id }
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200 }); // Still return 200
  }
});