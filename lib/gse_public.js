/* EagleEyE — gse-public
   GET /api/gse-data?table=dividends|ipos|rights|settings
   Public endpoint — no auth required
*/
const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300', // 5 min cache
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
  if (!tbl) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid table.' }) };

  try {
    const url = tbl === 'gse_settings'
      ? `${SUPABASE_URL}/rest/v1/${tbl}?select=*`
      : `${SUPABASE_URL}/rest/v1/${tbl}?select=*&order=created_at.desc`;

    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      },
    });
    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify({ data }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
