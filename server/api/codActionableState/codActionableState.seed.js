const {
  STATE_TYPES: { PACKAGE },
} = require('../../config/constants/index');

const packageStates = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 63,
  group_id: OPS,
  child_id: 70,
}, {
  state_id: 70,
  group_id: OPS,
  child_id: 68,
}, {
  state_id: 70,
  group_id: OPS,
  child_id: 43,
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = constants => packageStates(constants);
