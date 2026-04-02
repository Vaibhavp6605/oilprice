import { corsHeaders } from '@supabase/supabase-js/cors'

const EIA_BASE = 'https://api.eia.gov/v2/petroleum/pri/spt/data/';
const EIA_GAS_BASE = 'https://api.eia.gov/v2/petroleum/pri/gnd/data/';

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

  try {
    // Fetch Brent spot price (daily, last 30 days)
    const brentUrl = `${EIA_BASE}?api_key=${apiKey}&frequency=daily&data[0]=value&facets[series][]=RBRTE&sort[0][column]=period&sort[0][direction]=desc&length=30`;

    // Fetch WTI spot price (daily, last 30 days)
    const wtiUrl = `${EIA_BASE}?api_key=${apiKey}&frequency=daily&data[0]=value&facets[series][]=RWTC&sort[0][column]=period&sort[0][direction]=desc&length=30`;

    // Fetch US regular gasoline price (weekly)
    const gasUrl = `${EIA_GAS_BASE}?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[series][]=EMM_EPMR_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&length=10`;

    // Fetch Dubai crude (daily)
    const dubaiUrl = `${EIA_BASE}?api_key=${apiKey}&frequency=daily&data[0]=value&facets[series][]=RDUBAI&sort[0][column]=period&sort[0][direction]=desc&length=30`;

    // Fetch diesel price (weekly)
    const dieselUrl = `${EIA_GAS_BASE}?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[series][]=EMD_EPD2D_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&length=10`;

    const [brentRes, wtiRes, gasRes, dubaiRes, dieselRes] = await Promise.all([
      fetch(brentUrl),
      fetch(wtiUrl),
      fetch(gasUrl),
      fetch(dubaiUrl),
      fetch(dieselUrl),
    ]);

    const [brentData, wtiData, gasData, dubaiData, dieselData] = await Promise.all([
      brentRes.json(),
      wtiRes.json(),
      gasRes.json(),
      dubaiRes.json(),
      dieselRes.json(),
    ]);

    const result = {
      brent: brentData?.response?.data ?? [],
      wti: wtiData?.response?.data ?? [],
      gas: gasData?.response?.data ?? [],
      dubai: dubaiData?.response?.data ?? [],
      diesel: dieselData?.response?.data ?? [],
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
