
module.exports = (sequelize, DataTypes) => {
  const PackageCharge = sequelize.define('PackageCharge', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'package_charges',
    timestamps: false,
    underscored: true,
  });

  return PackageCharge;
};

