module.exports = (sequelize, DataTypes) => {
  const StoreCategory = sequelize.define('StoreCategory', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    category: DataTypes.STRING,
    slug: DataTypes.STRING,
  }, {
    tableName: 'store_categories',
    timestamps: true,
    underscored: true,
  });

  // StoreCategory.associate = (db) => {
  //   StoreCategory.belongsTo(db.StoreCatClub);
  // }
  return StoreCategory;
};
