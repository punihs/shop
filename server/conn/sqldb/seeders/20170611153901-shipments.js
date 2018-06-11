const { shipment } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('shipments', shipment, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('shipments', { id: [1] });
  },
};
