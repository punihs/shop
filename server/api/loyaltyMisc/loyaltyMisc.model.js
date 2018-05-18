module.exports = (sequelize, DataTypes) => {
  const loyaltyMisc = sequelize.define('loyaltyMisc', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    points: DataTypes.INTEGER,
    info: DataTypes.STRING,
  }, {
    tableName: 'loyalty_miscs',
    timestamps: true,
    underscored: true,
  });

  loyaltyMisc.associate = (db) => {
    loyaltyMisc.belongsTo(db.Customer);
  };


  return loyaltyMisc;
};

