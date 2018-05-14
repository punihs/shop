
module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('Country', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    discount: DataTypes.INTEGER,
  }, {
    tableName: 'countries',
    timestamps: false,
    underscored: true,
  });

  return Country;
};

