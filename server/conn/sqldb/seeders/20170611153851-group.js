const { groups } = require('./../constants');

// console.log('groups', groups);
module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(
      'groups', groups,
      {},
    );
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('groups', { id: groups.map(x => x.id) });
  },
};
