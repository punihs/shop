const { categories } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('categories', categories, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('categories', { id: [1] });
  },
};
