
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
    url_key: DataTypes.STRING,
    description: DataTypes.STRING(10000),
    return_policy_id: DataTypes.INTEGER,
    return_policy_text: DataTypes.STRING,
  }, {
    tableName: 'categories',
    timestamps: false,
    underscored: true,
  });

  return Category;
};

