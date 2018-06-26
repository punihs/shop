const { packageItemCategory } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('package_item_categories', packageItemCategory, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('package_item_categories', { truncate: true, cascade: false });
  },
};
