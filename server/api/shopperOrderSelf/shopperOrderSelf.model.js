module.exports = (sequelize, DataTypes) => {
  const ShopperOrderSelf = sequelize.define('ShopperOrderSelf', {
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
    total_fee: DataTypes.DOUBLE,
    payment_gateway_fee: DataTypes.DOUBLE,
    grand_total: DataTypes.DOUBLE,
    payment_gateway_name: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {
    tableName: 'shopper_orders_self',
    timestamps: true,
    underscored: true,
  });
  ShopperOrderSelf.associate = (db) => {
    ShopperOrderSelf.belongsTo(db.Customer);
  };
  return ShopperOrderSelf;
};
