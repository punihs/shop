const {
  engine, timestamps, properties, keys,
} = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface
      .createTable('direct_payments', Object
        .assign(properties('directPayment', DataTypes), {
          shipment_id: keys('shipments'),
        }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('direct_payments');
  },
};
