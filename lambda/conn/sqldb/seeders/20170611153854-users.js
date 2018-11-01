const { user } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('users', user, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('users', { id: user.map(x => x.id) });
  },
};
