const {
  STATE_TYPES: { SHIPMENT },
} = require('../../config/constants/index');

const shipmentStates = ({
  GROUP: {
    OPS,
  },
}) => [{
  state_id: 18,
  group_id: OPS,
  child_id: 1000,
}, {
  state_id: 19,
  group_id: OPS,
  child_id: 1000,
}, {
  state_id: 20,
  group_id: OPS,
  child_id: 1000,
},
{
  state_id: 21,
  group_id: OPS,
  child_id: 1000,
},
{
  state_id: 1000,
  group_id: OPS,
  child_id: 18,
},
{
  state_id: 1000,
  group_id: OPS,
  child_id: 20,
},
{
  state_id: 1000,
  group_id: OPS,
  child_id: 61,
},
{
  state_id: 1000,
  group_id: OPS,
  child_id: 72,
},
{
  state_id: 72,
  group_id: OPS,
  child_id: 18,
},
{
  state_id: 72,
  group_id: OPS,
  child_id: 19,
},
].map(x => ({ ...x, type: SHIPMENT }));

module.exports = constants => shipmentStates(constants);
