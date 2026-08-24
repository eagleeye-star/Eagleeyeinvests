const { toEvent, send } = require('../lib/adapter');
const adminUsers    = require('../lib/admin_users');
const adminFeedback = require('../lib/admin_feedback');
const adminStats    = require('../lib/admin_stats');
const adminGSE      = require('../lib/admin_gse');
const gsePublic     = require('../lib/gse_public');
const feedback      = require('../lib/feedback');

module.exports = async function(req, res) {
  const event = await toEvent(req);

  // Determine route from ALL possible URL sources
  const rawUrl   = req.url || '';
  const origUrl  = req.headers['x-original-url'] || req.headers['x-rewrite-url'] || '';
  const referer  = req.headers['referer'] || '';
  const combined = rawUrl + origUrl;

  // Check query string directly — most reliable after rewrite
  const qs = event.queryStringParameters || {};
  const hasTable = !!qs.table;
  const hasId    = !!qs.id;
  const hasKey   = !!qs.key;
  const hasAction= !!qs.action;
  const method   = req.method || 'GET';

  // gse-data: public read (no auth) — identified by table param with GET
  if (combined.includes('gse-data') || (hasTable && method === 'GET' && !hasId && !hasKey)) {
    const result = await gsePublic(event);
    send(res, result);
    return;
  }

  // feedback: public write
  if (combined.includes('/feedback') && method === 'POST') {
    const result = await feedback(event);
    send(res, result);
    return;
  }

  // admin-gse: CRUD on GSE tables (auth required)
  // Identified by: table param + non-GET method, or table=settings with key param
  if (combined.includes('admin-gse') || (hasTable && (method !== 'GET' || hasKey || hasId))) {
    const result = await adminGSE(event);
    send(res, result);
    return;
  }

  // Remaining admin routes
  if (combined.includes('admin-feedback') || (hasAction && qs.action === 'feedback')) {
    const result = await adminFeedback(event);
    send(res, result);
    return;
  }
  if (combined.includes('admin-stats')) {
    const result = await adminStats(event);
    send(res, result);
    return;
  }

  // Default: admin users
  const result = await adminUsers(event);
  send(res, result);
};

module.exports.config = { api: { bodyParser: false } };
