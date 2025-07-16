import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      throw new Error("Missing session ID");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Update transaction status in Supabase
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Find and update the pending transaction
      const { data: transactions, error: fetchError } = await supabaseService
        .from("transactions")
        .select("*")
        .eq("member_id", session.metadata?.memberId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) {
        throw new Error("Failed to fetch transaction");
      }

      if (transactions && transactions.length > 0) {
        const { error: updateError } = await supabaseService
          .from("transactions")
          .update({ 
            status: "complete",
            updated_at: new Date().toISOString()
          })
          .eq("id", transactions[0].id);

        if (updateError) {
          throw new Error("Failed to update transaction status");
        }

        // Update member status to active
        await supabaseService
          .from("members")
          .update({ 
            status: "active",
            updated_at: new Date().toISOString()
          })
          .eq("id", session.metadata?.memberId);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        paymentStatus: session.payment_status,
        member: session.metadata?.memberId 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        paymentStatus: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});