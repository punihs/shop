const { category } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('categories', category, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('categories', { id: [1] });
  },
};
