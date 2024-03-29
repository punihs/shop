module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    logo: DataTypes.STRING,
    type: DataTypes.STRING,
    slug: DataTypes.STRING,
  }, {
    tableName: 'stores',
    timestamps: false,
    underscored: true,
  });

  return Store;
};

