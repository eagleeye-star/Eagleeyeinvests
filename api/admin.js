const { toEvent, send } = require('../lib/adapter');
const adminUsers    = require('../lib/admin_users');
const adminFeedback = require('../lib/admin_feedback');
const adminStats    = require('../lib/admin_stats');

module.exports = async function(req, res) {
  const event = await toEvent(req);
  const url = req.url || '';
  let result;
  if (url.includes('admin-feedback'))  result = await adminFeedback(event);
  else if (url.includes('admin-stats')) result = await adminStats(event);
  else                                  result = await adminUsers(event);
  send(res, result);
};

// Tell Vercel not to pre-parse the request body
module.exports.config = { api: { bodyParser: false } };
