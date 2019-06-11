const {
  STATE_TYPES: { SHIPMENT },
} = require('../../config/constants/index');

const shipmentInactiveToShipmentAbandon = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 72,
  group_id: OPS,
  child_id: 61,
}].map(x => ({ ...x, type: SHIPMENT }));

module.exports = constants => shipmentInactiveToShipmentAbandon(constants);
