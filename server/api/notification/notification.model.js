
const properties = require('./notification.property');

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    properties(DataTypes),
    {
      tableName: 'notifications',
      timestamps: true,
      paranoid: true,
      underscored: true,
    },
  );

  Notification.associate = (db) => {
    Notification.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };
  return Notification;
};

