const properties = require('./packageItem.property');

module.exports = (sequelize, DataTypes) => {
  const PackageItem = sequelize.define('PackageItem', properties(DataTypes), {
    tableName: 'package_items',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  PackageItem.associate = (db) => {
    PackageItem.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'Creator',
    });
    PackageItem.belongsTo(db.Package);
    PackageItem.belongsTo(db.PackageItemCategory);
    db.PackageItemCategory.belongsTo(db.PackageItem);
  };

  return PackageItem;
};

