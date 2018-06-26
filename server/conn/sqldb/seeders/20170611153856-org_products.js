const { orgProduct } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('org_products', orgProduct, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('org_products', { id: orgProduct.map(x => x.id) });
  },
};
