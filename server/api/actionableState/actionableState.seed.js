module.exports = ({ GROUP: { MEMBER, OPS } }) => [{
  id: 1,
  state_id: 1, // processing
  group_id: OPS,
  child_id: 2, // after uploading package items customer input
}, {
  id: 2,
  state_id: 2, // customer input
  group_id: MEMBER,
  child_id: 3, // internal review
}, {
  id: 3,
  state_id: 3, // internal review
  group_id: OPS,
  child_id: 4, // apporved for shipping
}];
