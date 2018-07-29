const properties = require('./packageCharge.property');

module.exports = (sequelize, DataTypes) => {
  const PackageCharge = sequelize.define('PackageCharge', properties(DataTypes), {
    tableName: 'package_charges',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  PackageCharge.associate = (db) => {
    PackageCharge.belongsTo(db.Package, {
      foreignKey: 'id',
    });
  };

  return PackageCharge;
};

