module.exports = (sequelize, DataTypes) => {
  const PasswordReset = sequelize.define('PasswordReset', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    email: DataTypes.STRING,
    token: DataTypes.STRING,
  }, {
    tableName: 'password_resets',
    timestamps: true,
    underscored: true,
  });

  return PasswordReset;
};

