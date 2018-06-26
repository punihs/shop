const properties = require('./log.property');

module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', properties(DataTypes), {
    tableName: 'logs',
    timestamps: false,
    createdAt: 'created_at',
    underscored: true,
  });

  Log.associate = (db) => {
    Log.belongsTo(db.Session);
  };

  return Log;
};

