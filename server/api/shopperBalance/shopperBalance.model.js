module.exports = (sequelize, DataTypes) => {
  const ShopperBalance = sequelize.define('ShopperBalance', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    customer_id: DataTypes.INTEGER,
    amount: DataTypes.DOUBLE,

  }, {
    tableName: 'shopper_balances',
    timestamps: true,
    underscored: true,
  });
  return ShopperBalance;
};
