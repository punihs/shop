const properties = require('./referCode.property');

module.exports = (sequelize, DataTypes) => {
  const ReferCode = sequelize.define('ReferCode', properties(DataTypes), {
    tableName: 'refer_code',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });


  ReferCode.associate = (db) => {
    ReferCode.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };

  return ReferCode;
};

