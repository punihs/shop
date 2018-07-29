
const {
  engine, timestamps, keys, properties, id,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('dhl_logs', {
      id,
      ...properties('dhlLog', DataTypes),
      shipment_id: keys('shipments'),
      ...timestamps(1, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('dhl_logs');
  },
};
