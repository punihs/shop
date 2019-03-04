const { STATE_TYPES: { SHIPMENT } } = require('../../config/constants');

const shipmentStates = [
  {
    id: 72,
    name: 'InActive Shipment',
    config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
  },
].map(x => ({ ...x, type: SHIPMENT }));

module.exports = () => shipmentStates;
