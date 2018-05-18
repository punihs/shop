module.exports = (sequelize, DataTypes) => {
  const ShopperOrder = sequelize.define('ShopperOrder', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    reference_number: DataTypes.STRING,
    seller: DataTypes.STRING,
    total_quantity: DataTypes.INTEGER,
    total_price: DataTypes.DOUBLE,
    personal_shopper_cost: DataTypes.DOUBLE,
    sales_tax: DataTypes.DOUBLE,
    delivery_charge: DataTypes.DOUBLE,
    payment_gateway_fee: DataTypes.DOUBLE,
    sub_total: DataTypes.DOUBLE,
    amount_paid: DataTypes.DOUBLE,
    seller_invoice: DataTypes.STRING,
    wallet: DataTypes.FLOAT,
    promo_code: DataTypes.STRING,
    promo_discount: DataTypes.STRING,
    promo_info: DataTypes.STRING,
    if_promo_unavailable: DataTypes.STRING,
    instruction: DataTypes.STRING,
    payment_gateway_name: DataTypes.STRING,
    payment_status: DataTypes.STRING,
    status: DataTypes.STRING,
    admin_info: DataTypes.STRING,
    admin_read: {
      type: DataTypes.ENUM,
      values: ['no', 'yes'],
    },

  }, {
    tableName: 'shopper_orders_self',
    timestamps: true,
    underscored: true,
  });
  ShopperOrder.associate = (db) => {
    ShopperOrder.belongsTo(db.Customer);
  };
  return ShopperOrder;
};
