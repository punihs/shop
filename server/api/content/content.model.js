module.exports = (sequelize, DataTypes) => {
  const Content = sequelize.define('Content', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {
    tableName: 'contents',
    timestamps: true,
    underscored: true,
  });

  return Content;
};

