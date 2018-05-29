const { shipments } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('shipments', shipments, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('shipments', { id: [1] });
  },
};
