module.exports = (sequelize, DataTypes) => {
  const ScheduledMail = sequelize.define('ScheduledMail', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    type: DataTypes.STRING,
    type_id: DataTypes.INTEGER,
    condition: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {
    tableName: 'scheduled_mails',
    timestamps: true,
    underscored: true,
  });

  ScheduledMail.associate = (db) => {
    ScheduledMail.belongsTo(db.Customer);
  };

  return ScheduledMail;
};

