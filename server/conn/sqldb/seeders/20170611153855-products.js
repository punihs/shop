const { products } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('products', products, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('products', { id: [1] });
  },
};
