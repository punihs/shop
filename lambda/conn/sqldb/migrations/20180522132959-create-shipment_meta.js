const {
  engine, timestamps, properties, keys,
} = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface
      .createTable('shipment_meta', Object
        .assign(properties('shipmentMeta', DataTypes), {
          shipment_id: keys('shipments'),
        }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('shipment_meta');
  },
};
