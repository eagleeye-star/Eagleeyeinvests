/* EagleEyE — /api/gse-data
   Public endpoint — reads GSE events data from Supabase
   No auth required — anyone can read this data
*/
const SUPABASE_URL  = process.env.SUPABASE_URL  || 'https://jyhamtniuhlsbwcdfspa.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aGFtdG5pdWhsc2J3Y2Rmc3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNjE1MTgsImV4cCI6MjA5NzczNzUxOH0.1nT-wpRjjAIpgUk_BDTlu3z4Cvuz_G0nKX9l65cwpF0';

const TABLE_MAP = {
  dividends: 'gse_dividends',
  ipos:      'gse_ipos',
  rights:    'gse_rights',
  settings:  'gse_settings',
};

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const table = req.query?.table || new URLSearchParams(req.url.split('?')[1]||'').get('table');
  const tbl = TABLE_MAP[table];

  if (!tbl) {
    res.status(400).json({ error: 'Invalid table: '+table });
    return;
  }

  try {
    const url = tbl === 'gse_settings'
      ? `${SUPABASE_URL}/rest/v1/${tbl}?select=*`
      : `${SUPABASE_URL}/rest/v1/${tbl}?select=*&order=created_at.desc`;

    const sbRes = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await sbRes.json();
    res.status(200).json({ data: Array.isArray(data) ? data : [] });

  } catch(err) {
    console.error('gse-data error:', err.message);
    res.status(500).json({ error: err.message, data: [] });
  }
};

module.exports.config = { api: { bodyParser: false } };
