const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('packages', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    order_code: DataTypes.STRING,
    type: DataTypes.BOOLEAN,
    reference_code: DataTypes.STRING,
    locker_code: DataTypes.STRING,
    weight: DataTypes.STRING,
    number_of_items: DataTypes.INTEGER,
    price_amount: DataTypes.STRING,
    received_at: DataTypes.DATE,
    status: DataTypes.STRING,

    review: DataTypes.STRING,
    return_send: DataTypes.STRING,
    liquid: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    is_featured_seller: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    split_pack: DataTypes.STRING,
    info: DataTypes.STRING,
    admin_read: {
      type: DataTypes.ENUM,
      values: ['yes', 'no'],
    },
    admin_info: DataTypes.STRING,
    is_item_damaged: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    store_id: keys('stores'),
    shipment_id: keys('shipments'),
    created_by: keys('users'),
    customer_id: keys('users'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('packages');
  },
};
