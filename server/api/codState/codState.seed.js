const { STATE_TYPES: { PACKAGE } } = require('../../config/constants/index');

const packageStates = [{
  id: 70,
  name: 'Awaiting for Order',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = () => packageStates;
