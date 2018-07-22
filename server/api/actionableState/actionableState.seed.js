
const {
  STATE_TYPES: { PACKAGE, SHIPMENT },
} = require('../../config/constants');

const packageStates = ({
  GROUP: {
    OPS, MEMBER, BOT,
  },
}) => [{
  state_id: 42,
  group_id: MEMBER,
  child_id: 42,
}, {
  state_id: 42,
  group_id: MEMBER,
  child_id: 43,
}, {
  state_id: 42,
  group_id: MEMBER,
  child_id: 44,
}, {
  state_id: 44,
  group_id: MEMBER,
  child_id: 43,
}, {
  state_id: 44,
  group_id: MEMBER,
  child_id: 45,
}, {
  state_id: 45,
  group_id: MEMBER,
  child_id: 44,
}, {
  state_id: 44,
  group_id: MEMBER,
  child_id: 46,
}, {
  state_id: 46,
  group_id: OPS,
  child_id: 47,
}, {
  state_id: 46,
  group_id: OPS,
  child_id: 48,
}, {
  state_id: 48,
  group_id: OPS,
  child_id: 47,
}, {
  state_id: 48,
  group_id: OPS,
  child_id: 49,
}, {
  state_id: 46,
  group_id: OPS,
  child_id: 49,
}, {
  state_id: 49,
  group_id: OPS,
  child_id: 50,
}, {
  state_id: 49,
  group_id: OPS,
  child_id: 51,
}, {
  state_id: 47,
  group_id: OPS,
  child_id: 1,
}, {
  state_id: 47,
  group_id: OPS,
  child_id: 49,
}, {
  state_id: 48,
  group_id: OPS,
  child_id: 1,
}, {
  state_id: 42,
  group_id: OPS,
  child_id: 1,
}, {
  state_id: 1,
  group_id: OPS,
  child_id: 2,
}, {
  state_id: 1,
  group_id: OPS,
  child_id: 3,
}, {
  state_id: 1,
  group_id: OPS,
  child_id: 6,
}, {
  state_id: 4,
  group_id: OPS,
  child_id: 5,
}, {
  state_id: 5,
  group_id: BOT,
  child_id: 14,
}, {
  state_id: 5,
  group_id: MEMBER,
  child_id: 15,
}, {
  state_id: 5,
  group_id: MEMBER,
  child_id: 11,
}, {
  state_id: 11,
  group_id: OPS,
  child_id: 12,
}, {
  state_id: 6,
  group_id: MEMBER,
  child_id: 7,
}, {
  state_id: 7,
  group_id: OPS,
  child_id: 8,
}, {
  state_id: 7,
  group_id: OPS,
  child_id: 9,
}, {
  state_id: 8,
  group_id: OPS,
  child_id: 10,
}, {
  state_id: 5,
  group_id: MEMBER,
  child_id: 7,
}, {
  state_id: 2,
  group_id: OPS,
  child_id: 5,
}, {
  state_id: 3,
  group_id: MEMBER,
  child_id: 4,
}, {
  state_id: 9,
  group_id: OPS,
  child_id: 8,
}, {
  state_id: 15,
  group_id: OPS,
  child_id: 13,
}, {
  state_id: 12,
  group_id: OPS,
  child_id: 5,
}].map(x => ({ ...x, type: PACKAGE }));

const shipmentStates = ({
  GROUP: {
    OPS, MEMBER, BOT,
  },
}) => [{
  state_id: 16,
  group_id: MEMBER,
  child_id: 16,
}, {
  state_id: 16,
  group_id: OPS,
  child_id: 17,
}, {
  state_id: 17,
  group_id: OPS,
  child_id: 18,
}, {
  state_id: 18,
  group_id: OPS,
  child_id: 19,
}, {
  state_id: 19,
  group_id: MEMBER,
  child_id: 20,
}, {
  state_id: 20,
  group_id: BOT,
  child_id: 21,
}, {
  state_id: 20,
  group_id: OPS,
  child_id: 22,
}, {
  state_id: 22,
  group_id: OPS,
  child_id: 23,
}, {
  state_id: 23,
  group_id: OPS,
  child_id: 24,
}, {
  state_id: 24,
  group_id: BOT,
  child_id: 25,
}, {
  state_id: 25,
  group_id: OPS,
  child_id: 26,
}, {
  state_id: 25,
  group_id: BOT,
  child_id: 27,
}, {
  state_id: 25,
  group_id: OPS,
  child_id: 28,
}, {
  state_id: 25,
  group_id: OPS,
  child_id: 29,
}, {
  state_id: 25,
  group_id: BOT,
  child_id: 30,
}, {
  state_id: 25,
  group_id: MEMBER,
  child_id: 31,
},
//   {
//   state_id: 28,
//   group_id: MEMBER,
//   child_id: 242,
// },
{
  state_id: 27,
  group_id: OPS,
  child_id: 32,
}, {
  state_id: 29,
  group_id: OPS,
  child_id: 33,
}, {
  state_id: 30,
  group_id: BOT,
  child_id: 34,
}, {
  state_id: 31,
  group_id: MEMBER,
  child_id: 34,
}, {
  state_id: 32,
  group_id: OPS,
  child_id: 35,
}, {
  state_id: 33,
  group_id: OPS,
  child_id: 36,
}, {
  state_id: 36,
  group_id: OPS,
  child_id: 37,
}, {
  state_id: 35,
  group_id: OPS,
  child_id: 38,
}, {
  state_id: 38,
  group_id: MEMBER,
  child_id: 39,
}, {
  state_id: 25,
  group_id: OPS,
  child_id: 40,
}, {
  state_id: 36,
  group_id: BOT,
  child_id: 37,
},
//  {
//   state_id: 42,
//   group_id: BOT,
//   child_id: 40,
// }// ,
{
  state_id: 16,
  group_id: MEMBER,
  child_id: 41,
}].map(x => ({ ...x, type: SHIPMENT }));

module.exports = constants => packageStates(constants)
  .concat(shipmentStates(constants));
