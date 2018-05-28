
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    action_type: DataTypes.STRING,
    action_id: DataTypes.STRING,
    action_description: DataTypes.STRING,
    solve_status: DataTypes.STRING,
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

