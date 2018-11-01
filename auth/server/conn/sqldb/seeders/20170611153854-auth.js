const { auth } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('auth', auth, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('auth', { id: auth.map(x => x.id) });
  },
};
