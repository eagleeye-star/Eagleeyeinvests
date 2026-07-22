const { toEvent, send } = require('../lib/adapter');
const adminUsers    = require('../lib/admin_users');
const adminFeedback = require('../lib/admin_feedback');
const adminStats    = require('../lib/admin_stats');
const adminGSE      = require('../lib/admin_gse');
const gsePublic     = require('../lib/gse_public');
const feedback      = require('../lib/feedback');

module.exports = async function(req, res) {
  const event = await toEvent(req);
  const url = req.headers['x-original-url'] || req.headers['x-rewrite-url'] || req.url || '';
  let result;

  // Public endpoints — no auth
  if (url.includes('gse-data'))  { result = await gsePublic(event); send(res, result); return; }
  if (url.includes('/feedback'))  { result = await feedback(event);  send(res, result); return; }

  // Admin endpoints
  if      (url.includes('admin-feedback')) result = await adminFeedback(event);
  else if (url.includes('admin-stats'))    result = await adminStats(event);
  else if (url.includes('admin-gse'))      result = await adminGSE(event);
  else                                     result = await adminUsers(event);
  send(res, result);
};

module.exports.config = { api: { bodyParser: false } };
