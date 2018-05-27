const { orgProducts } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('org_products', orgProducts, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('org_products', { id: orgProducts.map(x => x.id) });
  },
};
