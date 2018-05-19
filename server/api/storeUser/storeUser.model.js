module.exports = (sequelize, DataTypes) => {
  const StoreUser = sequelize.define('StoreUser', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'store_users',
    timestamps: true,
    underscored: true,
  });

  StoreUser.associate = (db) => {
    StoreUser.belongsTo(db.User);
    StoreUser.belongsTo(db.Store);
  };

  return StoreUser;
};

