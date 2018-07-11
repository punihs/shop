
const properties = require('./campaign.property');

module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define(
    'Campaign',
    properties(DataTypes),
    {
      tableName: 'campaigns',
      timestamps: true,
      paranoid: true,
      underscored: true,
    },
  );

  Campaign.associate = (db) => {
    Campaign.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };
  return Campaign;
};

