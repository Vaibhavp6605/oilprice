const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('EIA_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'EIA_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const debug = url.searchParams.get('debug') === '1';

  try {
    // EIA API v2 endpoints
    // Brent: PET.RBRTE.D (Europe Brent Spot Price FOB)
    // WTI: PET.RWTC.D (Cushing OK WTI Spot Price FOB)
    const spotBase = 'https://api.eia.gov/v2/petroleum/pri/spt/data/';
    const gasBase = 'https://api.eia.gov/v2/petroleum/pri/gnd/data/';

    // Brent spot price (daily)
    const brentUrl = `${spotBase}?api_key=${apiKey}&frequency=daily&data[0]=value&facets[series][]=RBRTE&sort[0][column]=period&sort[0][direction]=desc&length=30`;

    // WTI spot price (daily)
    const wtiUrl = `${spotBase}?api_key=${apiKey}&frequency=daily&data[0]=value&facets[series][]=RWTC&sort[0][column]=period&sort[0][direction]=desc&length=30`;

    // US regular gasoline retail (weekly)
    const gasUrl = `${gasBase}?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[series][]=EMM_EPMR_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&length=10`;

    // US diesel retail (weekly)
    const dieselUrl = `${gasBase}?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[series][]=EMD_EPD2D_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&length=10`;

    const [brentRes, wtiRes, gasRes, dieselRes] = await Promise.all([
      fetch(brentUrl),
      fetch(wtiUrl),
      fetch(gasUrl),
      fetch(dieselUrl),
    ]);

    const [brentRaw, wtiRaw, gasRaw, dieselRaw] = await Promise.all([
      brentRes.json(),
      wtiRes.json(),
      gasRes.json(),
      dieselRes.json(),
    ]);

    if (debug) {
      return new Response(JSON.stringify({
        brentRaw, wtiRaw, gasRaw, dieselRaw,
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey.length,
      }, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = {
      brent: brentRaw?.response?.data ?? [],
      wti: wtiRaw?.response?.data ?? [],
      gas: gasRaw?.response?.data ?? [],
      diesel: dieselRaw?.response?.data ?? [],
      fetchedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
