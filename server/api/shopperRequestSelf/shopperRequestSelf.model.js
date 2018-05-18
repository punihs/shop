module.exports = (sequelize, DataTypes) => {
  const ShopperRequestSelf = sequelize.define('ShopperRequestSelf', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    order_id: DataTypes.INTEGER,
    url: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DOUBLE,
    invoice: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {
    tableName: 'shopper_requests_self',
    timestamps: true,
    underscored: true,
  });
  ShopperRequestSelf.associate = (db) => {
    ShopperRequestSelf.belongsTo(db.Customer);
  };
  return ShopperRequestSelf;
};
