
module.exports = (sequelize, DataTypes) => {
  const Partner = sequelize.define('Partner', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.INTEGER,
  }, {
    tableName: 'partners',
    timestamps: false,
    underscored: true,
  });

  return Partner;
};

