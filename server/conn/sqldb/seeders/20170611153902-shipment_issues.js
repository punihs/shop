const { shipmentIssue } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('shipment_issues', shipmentIssue, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('shipment_issues', { id: [1] });
  },
};
