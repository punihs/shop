const properties = require('./notificationSubscription.property');

module.exports = (sequelize, DataTypes) => {
  const NotificationSubscription = sequelize.define('NotificationSubscription', properties(DataTypes), {
    tableName: 'notification_subscriptions',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  NotificationSubscription.associate = (db) => {
    NotificationSubscription.belongsTo(db.User);
  };

  return NotificationSubscription;
};
