const {
  STATE_TYPES: { PACKAGE },
} = require('../../config/constants/index');

const packageStates = ({
  GROUP: {
    OPS, MEMBER,
  },
}) => [{
  state_id: 42,
  group_id: MEMBER,
  child_id: 62,
}, {
  state_id: 45,
  group_id: MEMBER,
  child_id: 46,
}, {
  state_id: 46,
  group_id: OPS,
  child_id: 63,
}, {
  state_id: 63,
  group_id: OPS,
  child_id: 65,
}, {
  state_id: 63,
  group_id: OPS,
  child_id: 49,
}, {
  state_id: 63,
  group_id: OPS,
  child_id: 48,
}, {
  state_id: 48,
  group_id: OPS,
  child_id: 66,
}, {
  state_id: 66,
  group_id: OPS,
  child_id: 68,
}, {
  state_id: 49,
  group_id: MEMBER,
  child_id: 67,
}, {
  state_id: 49,
  group_id: MEMBER,
  child_id: 43,
}, {
  state_id: 67,
  group_id: OPS,
  child_id: 48,
}, {
  state_id: 67,
  group_id: OPS,
  child_id: 43,
}, {
  state_id: 43,
  group_id: OPS,
  child_id: 50,
}, {
  state_id: 43,
  group_id: OPS,
  child_id: 51,
}, {
  state_id: 63,
  group_id: MEMBER,
  child_id: 43,
}, {
  state_id: 46,
  group_id: MEMBER,
  child_id: 43,
}, {
  state_id: 64,
  group_id: OPS,
  child_id: 48,
}, {
  state_id: 65,
  group_id: MEMBER,
  child_id: 43,
}, {
  state_id: 65,
  group_id: MEMBER,
  child_id: 64,
}].map(x => ({ ...x, type: PACKAGE }));

module.exports = constants => packageStates(constants);
