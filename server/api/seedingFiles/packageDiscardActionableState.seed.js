const {
  STATE_TYPES: { PACKAGE },
} = require('../../config/constants/index');

const packageDiscardActionableState = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 71,
  group_id: OPS,
  child_id: 13,
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = constants => packageDiscardActionableState(constants);
