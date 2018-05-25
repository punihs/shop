const { PRICE_ENTERER: { SHOPPRE, CUSTOMER } } = require('../../config/constants');

module.exports = (sequelize, DataTypes) => {
  const PackageItem = sequelize.define('PackageItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price_amount: DataTypes.DOUBLE,
    total_amount: DataTypes.DOUBLE,
    object: DataTypes.STRING,
    price_entered_by: {
      type: DataTypes.ENUM,
      values: [SHOPPRE, CUSTOMER],
    },
  }, {
    tableName: 'package_items',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  PackageItem.associate = (db) => {
    PackageItem.belongsTo(db.Package);
    PackageItem.belongsTo(db.PackageItemCategory);
    db.PackageItemCategory.belongsTo(db.PackageItem);
  };

  return PackageItem;
};

