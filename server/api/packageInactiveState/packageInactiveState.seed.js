const { STATE_TYPES: { PACKAGE } } = require('../../config/constants');

const packageStates = [{
  id: 71,
  name: 'InActive Locker',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
},
{
  id: 1002,
  name: 'Package Storage',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 1003,
  name: 'Package Storage Exceeded',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = () => packageStates;
