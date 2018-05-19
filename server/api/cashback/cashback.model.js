module.exports = (sequelize, DataTypes) => {
  const Cashback = sequelize.define('Cashback', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    amount: DataTypes.INTEGER,
  }, {
    tableName: 'cashbacks',
    timestamps: false,
    underscored: true,
  });

  Cashback.associate = (db) => {
    Cashback.belongsTo(db.Campaign);
    Cashback.belongsTo(db.Shipment);
    Cashback.belongsTo(db.User);
  };

  return Cashback;
};

