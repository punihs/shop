module.exports = (sequelize, DataTypes) => {
  const LockerCharge = sequelize.define('LockerCharge', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    charge: DataTypes.DECIMAL(8, 2),
  }, {
    tableName: 'locker_charges',
    timestamps: true,
    underscored: true,
  });

  return LockerCharge;
};

