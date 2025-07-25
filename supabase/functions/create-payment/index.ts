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
    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const body = await req.json();
    const { memberId, amount, period, membershipType = "basic" } = body;

    if (!memberId || !amount || !period) {
      throw new Error("Missing required fields: memberId, amount, period");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Gym Membership - ${period}`,
              description: `${membershipType} membership for ${period}` 
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        memberId,
        period,
        membershipType,
        userId: user.id
      }
    });

    // Create pending transaction record in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const today = new Date();
    let endDate: Date;
    
    if (period === "daily") {
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 1);
    } else if (period === "weekly") {
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 7);
    } else if (period === "monthly") {
      endDate = new Date(today);
      endDate.setMonth(today.getMonth() + 1);
    } else {
      // Default to monthly for other periods
      endDate = new Date(today);
      endDate.setMonth(today.getMonth() + 1);
    }

    await supabaseService.from("transactions").insert({
      member_id: memberId,
      amount: amount,
      period: period,
      start_date: today.toISOString().split('T')[0],
      ending_date: endDate.toISOString().split('T')[0],
      status: 'pending',
      payment_method: 'stripe',
      description: `${period} ${membershipType} membership payment`,
      user_id: user.id
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});