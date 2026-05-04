// Fetches live AIS ship positions in the Strait of Hormuz from aisstream.io
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bounding box for Strait of Hormuz / approaches
const BBOX = [[24.0, 54.5], [27.5, 58.5]];

interface Ship {
  mmsi: number;
  name: string;
  lat: number;
  lon: number;
  sog: number; // speed over ground
  cog: number; // course over ground
  type: number;
  ts: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("AISSTREAM_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AISSTREAM_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ships = new Map<number, Ship>();

  try {
    const ws = new WebSocket("wss://stream.aisstream.io/v0/stream");

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        try { ws.close(); } catch {}
        resolve();
      }, 6000); // collect for 6s

      ws.onopen = () => {
        ws.send(JSON.stringify({
          APIKey: apiKey,
          BoundingBoxes: [BBOX],
          FilterMessageTypes: ["PositionReport", "ShipStaticData"],
        }));
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          const meta = msg.MetaData || {};
          const mmsi = meta.MMSI;
          if (!mmsi) return;

          const existing = ships.get(mmsi) || {
            mmsi, name: "", lat: 0, lon: 0, sog: 0, cog: 0, type: 0, ts: Date.now(),
          };

          if (msg.MessageType === "PositionReport") {
            const p = msg.Message?.PositionReport;
            if (p) {
              existing.lat = p.Latitude;
              existing.lon = p.Longitude;
              existing.sog = p.Sog || 0;
              existing.cog = p.Cog || 0;
              existing.ts = Date.now();
            }
          } else if (msg.MessageType === "ShipStaticData") {
            const s = msg.Message?.ShipStaticData;
            if (s) {
              existing.name = (s.Name || "").trim();
              existing.type = s.Type || 0;
            }
          }
          if (meta.ShipName && !existing.name) existing.name = String(meta.ShipName).trim();
          ships.set(mmsi, existing);
        } catch {}
      };

      ws.onerror = (e) => {
        clearTimeout(timeout);
        reject(e);
      };
      ws.onclose = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const list = Array.from(ships.values()).filter((s) => s.lat && s.lon);
  return new Response(JSON.stringify({ ships: list, count: list.length, ts: Date.now() }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
