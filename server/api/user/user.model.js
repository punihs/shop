const bcrypt = require('node-php-password');

const properties = require('./user.property');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', properties(DataTypes), {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
    hooks: {
      beforeCreate: function beforeCreate(instance) {
        if (instance.changed('password')) {
          instance
            .set('password', bcrypt.hash(instance.password));
        }
      },

      beforeUpdate: function beforeUpdate(instance) {
        if (instance.changed('password')) {
          instance
            .set('password', bcrypt.hash(instance.password));
        }
      },
    },
  });

  User.associate = (db) => {
    User.hasMany(db.App);
    User.hasMany(db.AccessToken);
    User.hasMany(db.RefreshToken);
    User.hasMany(db.Session);
    User.hasMany(db.Package, {
      foreignKey: 'customer_id',
    });
    User.belongsTo(db.Country);
    User.belongsTo(db.Group);
    User.belongsTo(db.User, {
      foreignKey: 'referred_by',
      as: 'ReferredUser',
    });
  };

  User.prototype.verifyPassword = function verifyPassword(password, cb) {
    return bcrypt.verify(password, this.password)
      ? cb(null, this.toJSON())
      : cb(null, false);
  };

  User.prototype.revokeTokens = (db, userId) => {
    const expires = new Date();
    return Promise.all([
      db.AccessToken.update(
        { expires },
        { where: { user_id: userId } },
      ),
      db.RefreshToken.update(
        { expires },
        { where: { user_id: userId } },
      ),
    ]);
  };

  return User;
};

