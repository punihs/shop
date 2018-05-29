const { shipmentIssues } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('shipment_issues', shipmentIssues, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('shipment_issues', { id: [1] });
  },
};
