const {
  STATE_TYPES: { PACKAGE },
} = require('../../config/constants/index');

const packageReadyToDiscardActionableState = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 5,
  group_id: OPS,
  child_id: 13,
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = constants => packageReadyToDiscardActionableState(constants);
