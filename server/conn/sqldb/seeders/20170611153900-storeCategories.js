const { storeCategory } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('store_categories', storeCategory, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('store_categories', { truncate: true, cascade: false });
  },
};
