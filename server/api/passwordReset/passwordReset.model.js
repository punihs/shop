const properties = require('./passwordReset.property');

module.exports = (sequelize, DataTypes) => {
  const PasswordReset = sequelize.define('PasswordReset', properties(DataTypes), {
    tableName: 'password_reset',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  return PasswordReset;
};

