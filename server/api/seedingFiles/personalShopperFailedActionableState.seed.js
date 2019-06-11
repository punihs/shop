const {
  STATE_TYPES: { PACKAGE },
} = require('../../config/constants/index');

const personalShopperFailedActionableState = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 46,
  group_id: OPS,
  child_id: 45,
}, {
  state_id: 63,
  group_id: OPS,
  child_id: 43,
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = constants => personalShopperFailedActionableState(constants);
