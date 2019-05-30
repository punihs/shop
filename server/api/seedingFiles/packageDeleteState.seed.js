const { STATE_TYPES: { PACKAGE } } = require('../../config/constants/index');

const packageStates = [{
  id: 73,
  name: 'Package Deleted',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = () => packageStates;
