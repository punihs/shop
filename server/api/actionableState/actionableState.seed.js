module.exports = ({ GROUP: { MEMBER, OPS } }) => {
  const CUSTOMER = OPS;
  const OPERATIONS = MEMBER;
  return [{
    id: 1,
    state_id: 1, // processing
    group_id: OPERATIONS,
    child_id: 2, // after uploading package items customer input
  }, {
    id: 2,
    state_id: 2, // customer input
    group_id: CUSTOMER,
    child_id: 3, // internal review
  }, {
    id: 3,
    state_id: 3, // internal review
    group_id: OPERATIONS,
    child_id: 4, // apporved for shipping
  }];
};
