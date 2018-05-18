module.exports = (sequelize, DataTypes) => {
  const FavoriteStore = sequelize.define('FavoriteStore', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'favorite_stores',
    timestamps: true,
    underscored: true,
  });


  FavoriteStore.associate = (db) => {
    FavoriteStore.belongsTo(db.Customer);
    FavoriteStore.belongsTo(db.StoreCatClubs);
  };

  return FavoriteStore;
};

