
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'notifications',
    timestamps: false,
    underscored: true,
  });

  Notification.associate = (db) => {
    Notification.belongsTo(db.User);
  };


  return Notification;
};

