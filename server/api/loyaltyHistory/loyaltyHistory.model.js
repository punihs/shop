module.exports = (sequelize, DataTypes) => {
  const LoyaltyHistory = sequelize.define('LoyaltyHistory', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    points: DataTypes.INTEGER,
    redeemed: DataTypes.DATE,
  }, {
    tableName: 'loyalty_history',
    timestamps: true,
    underscored: true,
  });

  return LoyaltyHistory;
};

