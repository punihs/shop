const { storeCategoryClub } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('store_category_clubs', storeCategoryClub, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('store_category_clubs', { truncate: true, cascade: false });
  },
};
