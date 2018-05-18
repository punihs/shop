module.exports = (sequelize, DataTypes) => {
  const StoreCatClub = sequelize.define('StoreCatClub', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    url: DataTypes.STRING,
    rank: DataTypes.INTEGER,
    info: DataTypes.STRING,
    featured: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
  }, {
    tableName: 'store_cat_clubs',
    timestamps: true,
    underscored: true,
  });

  StoreCatClub.associate = (db) => {
    StoreCatClub.belongsTo(db.Store);
  };
  return StoreCatClub;
};
