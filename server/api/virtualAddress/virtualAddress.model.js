const properties = require('./virtualAddress.property');

module.exports = (sequelize, DataTypes) => {
  const VirtualAddress = sequelize.define('VirtualAddress', properties(DataTypes), {
    tableName: 'virtual_addresses',
    timestamps: false,
    paranoid: false,
    underscored: true,
  });

  VirtualAddress.associate = (db) => {
    VirtualAddress.belongsTo(db.User, {
      foreignKey: 'customer_id',
    });

    VirtualAddress.belongsTo(db.User, {
      foreignKey: 'customer_id',
    });
  };

  return VirtualAddress;
};

