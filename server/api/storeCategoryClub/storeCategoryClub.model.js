const properties = require('./storeCategoryClub.property');

module.exports = (sequelize, DataTypes) => {
  const StoreCategoryClub = sequelize.define('storeCategoryClub', properties(DataTypes), {
    tableName: 'store_category_clubs',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  StoreCategoryClub.associate = (db) => {
    StoreCategoryClub.belongsTo(db.Store);
    StoreCategoryClub.belongsTo(db.StoreCategory);
  };
  return StoreCategoryClub;
};
