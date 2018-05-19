module.exports = (sequelize, DataTypes) => {
  const PackageItemCategory = sequelize.define('PackageItemCategory', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
  }, {
    tableName: 'package_item_categories',
    timestamps: true,
    underscored: true,
  });

  return PackageItemCategory;
};

