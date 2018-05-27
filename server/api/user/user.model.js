const bcrypt = require('node-php-password');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    salutation: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    locker_code: DataTypes.STRING,
    country_code: DataTypes.STRING,
    phone: DataTypes.STRING,
    wallet_balance_amount: DataTypes.DECIMAL(15, 2),
    email_verify: {
      type: DataTypes.ENUM,
      values: ['yes', 'no'],
    },
    email_token: DataTypes.STRING,
    remember_token: DataTypes.STRING,
    admin_info: DataTypes.STRING,
    admin_read: {
      type: DataTypes.ENUM,
      values: ['yes', 'no'],
    },
    is_prime: DataTypes.INTEGER,
    is_seller: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    medium: DataTypes.STRING,
    google_contacts_accessed: DataTypes.BOOLEAN,
    otp: DataTypes.STRING,
  }, {
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

