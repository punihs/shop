const { STATE_TYPES: { PACKAGE } } = require('../../config/constants/index');

const packageStates = [{
  id: 62,
  name: 'Order Deleted',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 63,
  name: 'Payment Confirmed',
  config: '{"color":"success","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 64,
  name: 'Order Proceed',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 65,
  name: 'Price Changed',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 66,
  name: 'In Transit',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 67,
  name: 'Await For Stock',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 68,
  name: 'Order Completed',
  config: '{"color":"success","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 69,
  name: 'Other Items Proceed',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = () => packageStates;
