const {
  STATE_TYPES: { PACKAGE },
} = require('../../config/constants/index');

const packageDiscardToReadyActionableState = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 71,
  group_id: OPS,
  child_id: 5,
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = constants => packageDiscardToReadyActionableState(constants);
