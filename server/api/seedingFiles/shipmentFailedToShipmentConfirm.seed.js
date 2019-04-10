const {
  STATE_TYPES: { SHIPMENT },
} = require('../../config/constants/index');

const shipmentFailedToShipmentConfirm = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 21,
  group_id: OPS,
  child_id: 22,
}].map(x => ({ ...x, type: SHIPMENT }));

module.exports = constants => shipmentFailedToShipmentConfirm(constants);
