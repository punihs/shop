module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
  });
  return Category;
};
