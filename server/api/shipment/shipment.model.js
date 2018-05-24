
module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define('Shipment', {
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
    package_count: DataTypes.INTEGER,
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
  }, {
    tableName: 'shipments',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  Shipment.associate = (db) => {
    Shipment.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });

    Shipment.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'Creator',
    });

    Shipment.belongsTo(db.PaymentGateway);
    Shipment.belongsTo(db.Country);
    Shipment.belongsTo(db.ShipmentType);
    db.Country.hasMany(Shipment);
  };

  return Shipment;
};

