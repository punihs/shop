const { users } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('users', users, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('users', { id: users.map(x => x.id) });
  },
};
