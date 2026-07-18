const { toEvent, send } = require('../lib/adapter');
const adminGSE  = require('../lib/admin_gse');
const gsePublic = require('../lib/gse_public');

module.exports = async function handler(req, res) {
  const event = await toEvent(req);
  const url = req.url || '';
  let result;
  if (url.includes('admin-gse')) result = await adminGSE(event);
  else                            result = await gsePublic(event);
  send(res, result);
};

module.exports.config = { api: { bodyParser: false } };
