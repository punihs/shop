const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('shipments', Object.assign({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    order_code: DataTypes.STRING,
    customer_name: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    packages_count: DataTypes.INTEGER,
    weight: DataTypes.DECIMAL(8, 2),
    value_amount: DataTypes.DECIMAL(8, 2),
    sub_total_amount: DataTypes.DECIMAL(8, 2),
    discount_amount: DataTypes.DECIMAL(8, 2),
    package_level_charges_amount: DataTypes.DECIMAL(8, 2),
    estimated_amount: DataTypes.DECIMAL(8, 2),
    wallet_amount: DataTypes.DECIMAL(8, 2),
    coupon_amount: DataTypes.DECIMAL(8, 2),
    loyalty_amount: DataTypes.DECIMAL(8, 2),
    payment_gateway_fee_amount: DataTypes.DECIMAL(8, 2),
    final_amount: DataTypes.DECIMAL(8, 2),
    is_axis_banned_item: DataTypes.BOOLEAN,
    courier_charge_amount: DataTypes.DECIMAL(8, 2),
    payment_status: DataTypes.STRING,
    shipping_status: DataTypes.STRING,
    admin_info: DataTypes.STRING,
    admin_read: {
      type: DataTypes.ENUM,
      values: ['yes', 'no'],
    },
    is_missed: DataTypes.BOOLEAN,

    // - ShippingPartner
    tracking_code: DataTypes.STRING,
    pick_up_charge_amount: DataTypes.INTEGER,
    number_of_packages: DataTypes.INTEGER,
    weight_by_shipping_partner: DataTypes.DOUBLE,
    value_by_shipping_partner: DataTypes.DOUBLE,
    country_id: keys('stores'),
    shipping_partner_id: keys('shipping_partners'),
    payment_gateway_id: keys('payment_gateways'),
    shipment_type_id: keys('shipment_types'),
    created_by: keys('users'),
    customer_id: keys('users'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('shipments');
  },
};
