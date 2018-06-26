const { product } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('products', product, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('products', { id: [1] });
  },
};
