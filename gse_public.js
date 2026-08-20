/* EagleEyE — gse-public
   GET /api/gse-data?table=dividends|ipos|rights|settings
   Public endpoint — no auth required
*/
const SUPABASE_URL  = process.env.SUPABASE_URL  || 'https://jyhamtniuhlsbwcdfspa.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aGFtdG5pdWhsc2J3Y2Rmc3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNjE1MTgsImV4cCI6MjA5NzczNzUxOH0.1nT-wpRjjAIpgUk_BDTlu3z4Cvuz_G0nKX9l65cwpF0';

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const qs = event.queryStringParameters || {};
  const table = qs.table;

  const TABLE_MAP = {
    dividends: 'gse_dividends',
    ipos:      'gse_ipos',
    rights:    'gse_rights',
    settings:  'gse_settings',
  };

  const tbl = TABLE_MAP[table];
  if (!tbl) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid table: '+table }) };

  try {
    const url = tbl === 'gse_settings'
      ? `${SUPABASE_URL}/rest/v1/${tbl}?select=*`
      : `${SUPABASE_URL}/rest/v1/${tbl}?select=*&order=created_at.desc`;

    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = []; }

    if (!res.ok) {
      console.error(`gse-public: Supabase error ${res.status} for table ${tbl}:`, text.substring(0,200));
      return { statusCode: 200, headers, body: JSON.stringify({ data: [], error: text.substring(0,100) }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ data: Array.isArray(data) ? data : [] }) };
  } catch (err) {
    console.error('gse-public error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message, data: [] }) };
  }
};
