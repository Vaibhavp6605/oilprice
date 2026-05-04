// Fetches live AIS ship positions in the Strait of Hormuz from aisstream.io
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bounding box for Strait of Hormuz / approaches
const BBOX = [[23.5, 54.0], [28.0, 59.0]];

interface Ship {
  mmsi: number;
  name: string;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  type: number;
  ts: number;
}

// Persistent cache across warm invocations — accumulates ship positions over time
const shipCache = new Map<number, Ship>();
const CACHE_TTL_MS = 15 * 60 * 1000; // drop ships not seen in 15 min
let lastCollectAt = 0;
const COLLECT_COOLDOWN_MS = 25_000; // don't reopen WS more than once per 25s

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("AISSTREAM_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AISSTREAM_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Skip new collection if we just collected — return cached snapshot
  const now = Date.now();
  if (now - lastCollectAt < COLLECT_COOLDOWN_MS && shipCache.size > 0) {
    const cached = Array.from(shipCache.values()).filter(s => now - s.ts < CACHE_TTL_MS);
    return new Response(JSON.stringify({ ships: cached, count: cached.length, cached: true, ts: now }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  lastCollectAt = now;

  const ships = shipCache;

  try {
    const ws = new WebSocket("wss://stream.aisstream.io/v0/stream");
    ws.binaryType = "arraybuffer";

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        try { ws.close(); } catch {}
        resolve();
      }, 15000); // collect for 15s

      ws.onopen = () => {
        const sub = {
          APIKey: apiKey,
          BoundingBoxes: [BBOX],
        };
        console.log("AIS subscribe:", JSON.stringify(sub));
        ws.send(JSON.stringify(sub));
      };

      let msgCount = 0;
      ws.onmessage = async (ev) => {
        msgCount++;
        try {
          let raw: string;
          if (typeof ev.data === "string") raw = ev.data;
          else if (ev.data instanceof ArrayBuffer) raw = new TextDecoder().decode(ev.data);
          else if (ev.data?.text) raw = await ev.data.text();
          else raw = String(ev.data);
          const msg = JSON.parse(raw);
          if (msgCount <= 3) console.log("AIS msg:", JSON.stringify(msg).slice(0, 300));
          if (msg.error) {
            console.error("AIS error:", msg.error);
            return;
          }
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
          // Fall back to position from MetaData if available
          if (!existing.lat && meta.latitude) existing.lat = meta.latitude;
          if (!existing.lon && meta.longitude) existing.lon = meta.longitude;
          ships.set(mmsi, existing);
        } catch (e) {
          console.error("parse err", e);
        }
      };

      ws.onerror = (e) => {
        console.error("ws error", e);
        clearTimeout(timeout);
        resolve();
      };
      ws.onclose = (e) => {
        console.log("ws close", e.code, e.reason, "msgs:", msgCount);
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
