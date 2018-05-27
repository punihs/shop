const { packageItemCategories } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('package_item_categories', packageItemCategories, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('package_item_categories', { truncate: true, cascade: false });
  },
};
