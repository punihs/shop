const properties = require('./storeCategory.property');

module.exports = (sequelize, DataTypes) => {
  const StoreCategory = sequelize.define('StoreCategory', properties(DataTypes), {
    tableName: 'store_categories',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  return StoreCategory;
};
