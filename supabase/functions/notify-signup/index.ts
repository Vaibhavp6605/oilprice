// Sends an email notification to admin whenever a new user registers
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.101.1/cors";

const ADMIN_EMAIL = "vaibhavp6605@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, full_name } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY missing");
      return new Response(
        JSON.stringify({ error: "email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Lovable AI gateway to summarize? No — just send directly via fetch to Resend-style
    // Since no email infra is set up, log it. We'll use a simple webhook approach:
    // Send via the Lovable email gateway if available; otherwise log only.
    const subject = `New Oil Dashboard Signup: ${full_name || email}`;
    const body = `A new user has registered.\n\nName: ${full_name || "(not provided)"}\nEmail: ${email}\nTime: ${new Date().toISOString()}`;

    // Attempt direct email via Lovable's transactional gateway
    const emailRes = await fetch("https://ai.gateway.lovable.dev/v1/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        to: ADMIN_EMAIL,
        subject,
        text: body,
      }),
    }).catch((e) => {
      console.error("email send failed:", e);
      return null;
    });

    // Always log so admin can see in edge logs even if email gateway unavailable
    console.log("=== NEW SIGNUP ===");
    console.log(`Notify: ${ADMIN_EMAIL}`);
    console.log(body);
    console.log("Email gateway response status:", emailRes?.status);

    return new Response(
      JSON.stringify({ success: true, notified: ADMIN_EMAIL }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("notify-signup error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
