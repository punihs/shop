const { group } = require('./../constants');

// console.log('groups', groups);
module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(
      'groups', group,
      {},
    );
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('groups', { id: group.map(x => x.id) });
  },
};
