const bcrypt = require('node-php-password');

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    locker: DataTypes.STRING,
    phone: DataTypes.STRING,
    country_code: DataTypes.STRING,
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
    tableName: 'customers',
    timestamps: false,
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

  Customer.associate = (db) => {
    Customer.hasMany(db.App);
    Customer.hasMany(db.AccessToken);
    Customer.hasMany(db.RefreshToken);
    Customer.hasMany(db.Session);
    Customer.belongsTo(db.Group);
    // http_referrer_id,
    //   referred_customer_id,
  };


  Customer.prototype.verifyPassword = function verifyPassword(password, cb) {
    return bcrypt.verify(password, this.password)
      ? cb(null, this.toJSON())
      : cb(null, false);
  };

  Customer.prototype.revokeTokens = (db) => {
    const expires = new Date();
    return Promise.all([
      db.AccessToken.update(
        { expires },
        { where: { Customer_id: this.id } },
      ),
      db.RefreshToken.update(
        { expires },
        { where: { Customer_id: this.id } },
      ),
    ]);
  };

  return Customer;
};

