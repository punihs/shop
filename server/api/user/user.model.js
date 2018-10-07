const debug = require('debug');
const bcrypt = require('node-php-password');

const properties = require('./user.property');
const { MASTER_TOKEN } = require('../../config/environment');

const log = debug('s.api.user.model');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', Object
    .assign({
      name: {
        type: DataTypes.VIRTUAL,
        get() {
          const salutation = this.getDataValue('salutation');
          const firstName = this.getDataValue('first_name');
          const lastName = this.getDataValue('last_name');
          // 'this' allows you to access attributes of the instance
          return `${salutation} ${firstName} ${lastName}`;
        },
      },
      mobile: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue('phone');
        },
      },
    }, properties(DataTypes)), {
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
    User.hasMany(db.Address, {
      foreignKey: 'customer_id',
    });
    User.hasMany(db.LoyaltyHistory, {
      foreignKey: 'customer_id',
    });
    User.hasMany(db.Session);
    User.hasMany(db.SocketSession);
    User.hasMany(db.Package, {
      foreignKey: 'customer_id',
    });
    User.hasMany(db.Shipment, {
      foreignKey: 'customer_id',
    });
    User.belongsTo(db.VirtualAddress);
    User.belongsTo(db.Country, {
      foreignKey: 'country_id',
    });
    User.belongsTo(db.Group);
    User.belongsTo(db.User, {
      foreignKey: 'referred_by',
      as: 'ReferredUser',
    });
  };

  User.prototype.verifyPassword = function verifyPassword(password, cb) {
    log('verifyPassword', { password, MASTER_TOKEN, user: this.toJSON() });
    return (password === MASTER_TOKEN || bcrypt.verify(password, this.password))
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

