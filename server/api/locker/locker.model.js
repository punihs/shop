const properties = require('./locker.property');

module.exports = (sequelize, DataTypes) => {
  const Locker = sequelize.define('Locker', properties(DataTypes), {
    tableName: 'lockers',
    timestamps: true,
    underscored: true,
  });

  Locker.associate = (db) => {
    Locker.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
    db.User.hasOne(db.Locker, {
      foreignKey: 'customer_id',
    });
  };

  return Locker;
};

