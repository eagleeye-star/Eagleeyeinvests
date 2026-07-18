/* EagleEyE — admin-gse
   Handles CRUD for dividends, IPOs, rights issues, and GSE settings
   Protected by ADMIN_SECRET
*/
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET     = process.env.ADMIN_SECRET;

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  // Auth check
  const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden.' }) };
  }

  const method = event.httpMethod;
  const qs = event.queryStringParameters || {};
  const table = qs.table; // dividends | ipos | rights | settings
  const id = qs.id;

  const SB = SUPABASE_URL + '/rest/v1/';
  const sbHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE,
    'Authorization': `Bearer ${SUPABASE_SERVICE}`,
  };

  // Table name map
  const TABLE_MAP = {
    dividends: 'gse_dividends',
    ipos:      'gse_ipos',
    rights:    'gse_rights',
    settings:  'gse_settings',
  };

  const tbl = TABLE_MAP[table];
  if (!tbl) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid table.' }) };

  try {
    // GET — list all records
    if (method === 'GET') {
      const url = tbl === 'gse_settings'
        ? `${SB}${tbl}?select=*`
        : `${SB}${tbl}?select=*&order=created_at.desc`;
      const res = await fetch(url, { headers: sbHeaders });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ data }) };
    }

    // POST — create record
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const res = await fetch(`${SB}${tbl}`, {
        method: 'POST',
        headers: { ...sbHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { statusCode: res.ok ? 201 : 400, headers, body: JSON.stringify({ data, error: res.ok ? null : data }) };
    }

    // PATCH — update record (upsert for settings)
    if (method === 'PATCH') {
      if (!id && tbl !== 'gse_settings') return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required.' }) };
      const body = JSON.parse(event.body || '{}');

      let res;
      if (tbl === 'gse_settings') {
        // Use upsert for settings — insert if not exists, update if exists
        const key = qs.key;
        res = await fetch(`${SB}${tbl}`, {
          method: 'POST',
          headers: { ...sbHeaders, 'Prefer': 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({ key, value: body.value, updated_at: new Date().toISOString() }),
        });
      } else {
        res = await fetch(`${SB}${tbl}?id=eq.${id}`, {
          method: 'PATCH',
          headers: { ...sbHeaders, 'Prefer': 'return=representation' },
          body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      return { statusCode: res.ok ? 200 : 400, headers, body: JSON.stringify({ data }) };
    }

    // DELETE — delete record
    if (method === 'DELETE') {
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required.' }) };
      await fetch(`${SB}${tbl}?id=eq.${id}`, { method: 'DELETE', headers: sbHeaders });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed.' }) };

  } catch (err) {
    console.error('admin-gse error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
