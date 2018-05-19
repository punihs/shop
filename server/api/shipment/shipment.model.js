
module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define('Shipment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    order_id: DataTypes.STRING,
    package_ids: DataTypes.STRING,
    full_name: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    payment_gateway_name: DataTypes.STRING,
    count: DataTypes.INTEGER,
    weight: DataTypes.DECIMAL(8, 2),
    value: DataTypes.DECIMAL(8, 2),
    sub_total: DataTypes.DECIMAL(8, 2),
    discount: DataTypes.DECIMAL(8, 2),
    package_level_charges: DataTypes.DECIMAL(8, 2),
    estimated: DataTypes.DECIMAL(8, 2),
    wallet: DataTypes.DECIMAL(8, 2),
    coupon: DataTypes.DECIMAL(8, 2),
    loyalty: DataTypes.DECIMAL(8, 2),
    payment_gateway_fee: DataTypes.DECIMAL(8, 2),
    final_amount: DataTypes.DECIMAL(8, 2),
    is_axis_banned_item: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    courier_charge: DataTypes.DECIMAL(8, 2),
    payment_status: DataTypes.STRING,
    shipping_status: DataTypes.STRING,
    admin_info: DataTypes.STRING,
    admin_read: {
      type: DataTypes.ENUM,
      values: ['yes', 'no'],
    },
    is_missed: DataTypes.INTEGER,
    promo_code: DataTypes.STRING,
    pick_up_charge: DataTypes.INTEGER,
    shipment_type: DataTypes.STRING,
    number_of_packages: DataTypes.INTEGER,
    weight_by_shipping_partner: DataTypes.DOUBLE,
    value_by_shipping_partner: DataTypes.DOUBLE,
    tracking_code: DataTypes.STRING,
  }, {
    tableName: 'ship_requests',
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

    Shipment.belongsTo(db.Country);
    db.Country.hasMany(Shipment);
  };

  return Shipment;
};

