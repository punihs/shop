const properties = require('./address.property');

module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', properties(DataTypes), {
    tableName: 'addresses',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  Address.associate = (db) => {
    Address.belongsTo(db.Country);
    Address.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };

  return Address;
};

