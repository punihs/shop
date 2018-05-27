const { stores } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('stores', stores, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('stores', { truncate: true, cascade: false });
  },
};
