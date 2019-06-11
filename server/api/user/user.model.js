const properties = require('./user.property');

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
    }, properties(DataTypes)), {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  User.associate = (db) => {
    User.hasMany(db.Package, {
      foreignKey: 'customer_id',
    });
    User.belongsTo(db.Country, {
      foreignKey: 'country_id',
    });
    User.belongsTo(db.Group);
  };

  return User;
};

