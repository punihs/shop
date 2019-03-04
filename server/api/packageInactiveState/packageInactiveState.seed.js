const { STATE_TYPES: { PACKAGE } } = require('../../config/constants');

const packageStates = [{
  id: 71,
  name: 'InActive Locker',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = () => packageStates;
