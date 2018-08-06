const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('shipment_mails', Object
    .assign(properties('shipmentMail', DataTypes), {
      shipment_id: keys('shipments'),
    }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('shipment_mails');
  },
};
