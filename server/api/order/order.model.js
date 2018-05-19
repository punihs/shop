const { SHIPMENT_TYPES: { PENDING, RECEIVED } } = require('../../config/constants');

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    tracking_code: DataTypes.STRING,
    invoice_code: DataTypes.STRING,
    comments: DataTypes.STRING,
    invoice_path: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM,
      values: [PENDING, RECEIVED],
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  });

  Order.associate = (db) => {
    Order.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });

    Order.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'Creator',
    });
    Order.belongsTo(db.Store);
  };

  return Order;
};

