module.exports = (sequelize, DataTypes) => {
  const ShopperRequest = sequelize.define('ShopperRequest', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    order_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    url: DataTypes.STRING,
    item_code: DataTypes.STRING,
    item_name: DataTypes.STRING,
    item_color: DataTypes.STRING,
    item_size: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    total_price: DataTypes.DOUBLE,
    note: DataTypes.STRING,
    if_item_unavailable: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {
    tableName: 'shopper_requests',
    timestamps: true,
    underscored: true,
  });
  ShopperRequest.associate = (db) => {
    ShopperRequest.belongsTo(db.Customer);
  };
  return ShopperRequest;
};
