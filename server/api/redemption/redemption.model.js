const properties = require('./redemption.property');

module.exports = (sequelize, DataTypes) => {
  const Redemption = sequelize.define('Redemption', properties(DataTypes), {
    tableName: 'redemptions',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });
  return Redemption;
};
