const { store } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('stores', store, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('stores', { truncate: true, cascade: false });
  },
};
