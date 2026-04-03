import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const EIA_API_KEY = Deno.env.get("EIA_API_KEY");

  if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing required environment variables" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Get the latest snapshot to know the current war day
    const { data: latestSnapshot } = await supabase
      .from("daily_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .single();

    const warStartDate = new Date("2026-02-28");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentWarDay = Math.floor(
      (today.getTime() - warStartDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    const todayStr = today.toISOString().split("T")[0];

    // 2. Fetch latest EIA prices
    let brentPrice = latestSnapshot?.brent_usd;
    let wtiPrice = latestSnapshot?.wti_usd;
    let gasPrice = latestSnapshot?.gas_avg;
    let dieselPrice = latestSnapshot?.diesel_avg;

    if (EIA_API_KEY && EIA_API_KEY.length > 10) {
      try {
        const spotBase = "https://api.eia.gov/v2/petroleum/pri/spt/data/";
        const gasBase = "https://api.eia.gov/v2/petroleum/pri/gnd/data/";

        const [brentRes, wtiRes, gasRes, dieselRes] = await Promise.all([
          fetch(`${spotBase}?api_key=${EIA_API_KEY}&frequency=daily&data[0]=value&facets[series][]=RBRTE&sort[0][column]=period&sort[0][direction]=desc&length=1`),
          fetch(`${spotBase}?api_key=${EIA_API_KEY}&frequency=daily&data[0]=value&facets[series][]=RWTC&sort[0][column]=period&sort[0][direction]=desc&length=1`),
          fetch(`${gasBase}?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=EMM_EPMR_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&length=1`),
          fetch(`${gasBase}?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=EMD_EPD2D_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&length=1`),
        ]);

        const [brentData, wtiData, gasData, dieselData] = await Promise.all([
          brentRes.json(), wtiRes.json(), gasRes.json(), dieselRes.json(),
        ]);

        const bv = brentData?.response?.data?.[0]?.value;
        const wv = wtiData?.response?.data?.[0]?.value;
        const gv = gasData?.response?.data?.[0]?.value;
        const dv = dieselData?.response?.data?.[0]?.value;

        if (bv) brentPrice = parseFloat(bv);
        if (wv) wtiPrice = parseFloat(wv);
        if (gv) gasPrice = parseFloat(gv);
        if (dv) dieselPrice = parseFloat(dv);
      } catch (e) {
        console.error("EIA fetch error:", e);
      }
    }

    // 3. Use AI to generate a new event and estimate ship traffic
    const lastEvents = await supabase
      .from("oil_events")
      .select("event_title, war_day, category")
      .order("war_day", { ascending: false })
      .limit(5);

    const recentEventsSummary = (lastEvents.data || [])
      .map((e) => `Day ${e.war_day}: ${e.event_title} [${e.category}]`)
      .join("\n");

    const prompt = `You are tracking the 2026 Iran War that started Feb 28, 2026. Today is ${todayStr}, War Day ${currentWarDay}.

Current Brent crude: $${brentPrice}/barrel. Latest known Hormuz ship traffic: ${latestSnapshot?.hormuz_ships || 5} ships/day. Iran production: ${latestSnapshot?.iran_production || 0.1} mbpd.

Recent events:
${recentEventsSummary}

Based on the ongoing conflict trajectory, generate:
1. ONE new realistic event for today (war day ${currentWarDay}) that continues the narrative
2. An estimated Strait of Hormuz daily ship count (realistic given the blockade, between 2-15)
3. An estimated Iran production level in mbpd (between 0.0-0.5 given destruction of infrastructure)
4. A conflict phase name (e.g. "Week ${Math.ceil(currentWarDay / 7)} Escalation")

The event should be plausible and reference real geopolitical actors (US, Israel, Iran, IRGC, Houthis, Gulf states, China, Russia, UN, NATO). Vary categories between: Military Escalation, Energy Infrastructure, Policy Response, Price Milestone.`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }],
          tools: [
            {
              type: "function",
              function: {
                name: "update_war_data",
                description: "Provides today's war update data",
                parameters: {
                  type: "object",
                  properties: {
                    event_title: { type: "string", description: "Short headline for the event (max 80 chars)" },
                    event_description: { type: "string", description: "1-2 sentence description of the event" },
                    category: { type: "string", enum: ["Military Escalation", "Energy Infrastructure", "Policy Response", "Price Milestone"] },
                    hormuz_ships: { type: "number", description: "Estimated ships per day through Hormuz (2-15)" },
                    iran_production_mbpd: { type: "number", description: "Iran oil production in million barrels per day (0.0-0.5)" },
                    phase: { type: "string", description: "Current conflict phase name" },
                  },
                  required: ["event_title", "event_description", "category", "hormuz_ships", "iran_production_mbpd", "phase"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "update_war_data" } },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("AI did not return structured data");
    }

    const update = JSON.parse(toolCall.function.arguments);

    // 4. Insert the new event
    const { error: eventError } = await supabase.from("oil_events").insert({
      event_date: todayStr,
      event_title: `DAY ${currentWarDay}: ${update.event_title}`,
      description: update.event_description,
      war_day: currentWarDay,
      category: update.category,
      brent_price_that_day: brentPrice,
      source: "AI-generated",
    });

    if (eventError) console.error("Event insert error:", eventError);

    // 5. Upsert daily snapshot
    const { error: snapError } = await supabase.from("daily_snapshots").upsert(
      {
        snapshot_date: todayStr,
        brent_usd: brentPrice,
        wti_usd: wtiPrice,
        dubai_usd: latestSnapshot?.dubai_usd, // keep last known
        gas_avg: gasPrice,
        diesel_avg: dieselPrice,
        hormuz_ships: update.hormuz_ships,
        iran_production: update.iran_production_mbpd,
        key_event: `DAY ${currentWarDay}: ${update.event_title}`,
        war_day: currentWarDay,
        phase: update.phase,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "snapshot_date" }
    );

    if (snapError) console.error("Snapshot upsert error:", snapError);

    return new Response(
      JSON.stringify({
        success: true,
        warDay: currentWarDay,
        event: update.event_title,
        hormuzShips: update.hormuz_ships,
        iranProduction: update.iran_production_mbpd,
        brentPrice,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("update-oil-data error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
