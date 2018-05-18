module.exports = (sequelize, DataTypes) => {
  const CustomerSource = sequelize.define('CustomerSource', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
  }, {
    tableName: 'customer_sources',
    timestamps: true,
    underscored: true,
  });

  return CustomerSource;
};

