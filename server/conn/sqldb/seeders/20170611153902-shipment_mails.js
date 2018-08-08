const { shipmentMail } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('shipment_mails', shipmentMail, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('shipment_mails', { id: [1] });
  },
};
