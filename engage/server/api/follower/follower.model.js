const properties = require('./follower.property');

module.exports = (sequelize, DataTypes) => {
  const Follower = sequelize.define('Follower', properties(DataTypes), {
    tableName: 'followers',
    timestamps: true,
    underscored: true,
  });

  Follower.associate = (db) => {
    Follower.belongsTo(db.User, {
      foreignKey: 'user_id',
    });

    Follower.belongsTo(db.User, {
      foreignKey: 'updated_by',
      as: 'updater',
    });

    Follower.belongsTo(db.User, {
      foreignKey: 'shared_by',
      as: 'sharedBy',
    });
  };

  return Follower;
};
