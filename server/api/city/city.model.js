
module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define('City', {
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

  City.associate = (db) => {
    City.belongsTo(db.Country);
  };

  return City;
};

