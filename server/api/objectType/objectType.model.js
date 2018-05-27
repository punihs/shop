
module.exports = (sequelize, DataTypes) => {
  const ObjectType = sequelize.define('ObjectType', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
  }, {
    tableName: 'cities',
    timestamps: false,
    underscored: true,
  });

  return ObjectType;
};

