const { toEvent, send } = require('../lib/adapter');
const getHoldings    = require('../lib/get_holdings');
const addHolding     = require('../lib/add_holding');
const updateHolding  = require('../lib/update_holding');
const deleteHolding  = require('../lib/delete_holding');
module.exports = async function(req, res) {
  const event = await toEvent(req);
  const url = req.url || '';
  let result;
  if (url.includes('add-holding'))         result = await addHolding(event);
  else if (url.includes('update-holding')) result = await updateHolding(event);
  else if (url.includes('delete-holding')) result = await deleteHolding(event);
  else                                      result = await getHoldings(event);
  send(res, result);
};
