module.exports = (sequelize, DataTypes) => {
  const Cashback = sequelize.define('Cashback', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    ship_request_id: DataTypes.INTEGER,
    customer_id: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
  }, {
    tableName: 'cashbacks',
    timestamps: false,
    underscored: true,
  });

  Cashback.associate = (db) => {
    Cashback.belongsTo(db.Campaign);
  };

  return Cashback;
};

