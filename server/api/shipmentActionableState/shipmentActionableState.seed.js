const {
  STATE_TYPES: { PACKAGE, SHIPMENT },
} = require('../../config/constants/index');

const packageStates = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 4,
  group_id: OPS,
  child_id: 3,
}].map(x => ({ ...x, type: PACKAGE }));

const shipmentStates = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 18,
  group_id: OPS,
  child_id: 61,
}, {
  state_id: 20,
  group_id: OPS,
  child_id: 61,
}, {
  state_id: 19,
  group_id: OPS,
  child_id: 61,
}, {
  state_id: 21,
  group_id: OPS,
  child_id: 61,
}, {
  state_id: 22,
  group_id: OPS,
  child_id: 61,
}, {
  state_id: 16,
  group_id: OPS,
  child_id: 61,
}, {
  state_id: 17,
  group_id: OPS,
  child_id: 61,
}].map(x => ({ ...x, type: SHIPMENT }));

module.exports = constants => packageStates(constants)
  .concat(shipmentStates(constants));
