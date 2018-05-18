module.exports = (sequelize, DataTypes) => {
  const LoyaltyPoint = sequelize.define('LoyaltyPoint', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    ship_request_id: DataTypes.INTEGER,
    level: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
    total: DataTypes.INTEGER,
  }, {
    tableName: 'loyalty_points',
    timestamps: true,
    underscored: true,
  });

  LoyaltyPoint.associate = (db) => {
    LoyaltyPoint.belongsTo(db.Customer);
  };

  return LoyaltyPoint;
};

