const { locker } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('lockers', locker, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('lockers', { truncate: true, cascade: false });
  },
};
