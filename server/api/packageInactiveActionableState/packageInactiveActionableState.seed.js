const {
  STATE_TYPES: { PACKAGE },
} = require('../../config/constants/index');

const packageStates = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 5,
  group_id: OPS,
  child_id: 71,
}, {
  state_id: 4,
  group_id: OPS,
  child_id: 71,
}, {
  state_id: 3,
  group_id: OPS,
  child_id: 71,
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = constants => packageStates(constants);
