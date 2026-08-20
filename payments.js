const { toEvent, send } = require('../lib/adapter');
const paystackInit = require('../lib/paystack_init');
const paystackWebhook = require('../lib/paystack_webhook');
const paystackVerify = require('../lib/paystack_verify');
module.exports = async function(req, res) {
  const event = await toEvent(req);
  const url = req.url || '';
  let result;
  if (url.includes('paystack-init'))         result = await paystackInit(event);
  else if (url.includes('paystack-webhook')) result = await paystackWebhook(event);
  else                                        result = await paystackVerify(event);
  send(res, result);
};

// Tell Vercel not to pre-parse the request body
module.exports.config = { api: { bodyParser: false } };
