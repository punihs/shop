const properties = require('./packageState.property');

module.exports = (sequelize, DataTypes) => {
  const PackageState = sequelize.define('PackageState', properties(DataTypes), {
    tableName: 'package_states',
    timestamps: true,
    underscored: true,
    defaultScope: {
      where: { status: 1 },
    },
  });

  PackageState.associate = (db) => {
    PackageState.hasMany(db.Package);

    PackageState.belongsTo(db.State, {
      foreignKey: 'state_id',
    });

    PackageState.belongsTo(db.User, {
      foreignKey: 'user_id',
    });
  };

  return PackageState;
};
