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
  child_id: 1003,
}, {
  state_id: 4,
  group_id: OPS,
  child_id: 1003,
}, {
  state_id: 3,
  group_id: OPS,
  child_id: 1003,
},
{
  state_id: 54,
  group_id: OPS,
  child_id: 1003,
},
{
  state_id: 1003,
  group_id: OPS,
  child_id: 13,
},
{
  state_id: 1003,
  group_id: OPS,
  child_id: 71,
},
{
  state_id: 1003,
  group_id: OPS,
  child_id: 5,
},
{
  state_id: 1003,
  group_id: OPS,
  child_id: 4,
},
{
  state_id: 1003,
  group_id: OPS,
  child_id: 3,
},
{
  state_id: 1003,
  group_id: OPS,
  child_id: 54,
},
{
  state_id: 71,
  group_id: OPS,
  child_id: 5,
},
].map(x => ({ ...x, type: PACKAGE }));

module.exports = constants => packageStates(constants);
