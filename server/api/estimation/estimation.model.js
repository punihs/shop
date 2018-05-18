module.exports = (sequelize, DataTypes) => {
  const Estimation = sequelize.define('Estimation', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    customer_id: DataTypes.INTEGER,
    amount: DataTypes.DOUBLE,
    time: DataTypes.TIME,
    country: DataTypes.INTEGER,
    weight: DataTypes.DOUBLE,
  }, {
    tableName: 'estimations',
    timestamps: false,
    underscored: true,
  });

  return Estimation;
};

