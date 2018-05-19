
const moment = require('moment');

module.exports = function AuthCodeModel(sequelize, DataTypes) {
  const AuthCode = sequelize.define('AuthCode', {
    id: {
      type: DataTypes.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    auth_code: {
      type: DataTypes.STRING(256),
      validate: {
        len: [10, 256],
      },
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: function setExpires() {
        return moment().add(30, 'seconds');
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    tableName: 'auth_codes',
    timestamps: false,
    underscored: true,
  });

  AuthCode.associate = (db) => {
    AuthCode.belongsTo(db.App, {
      foreignKey: 'app_id',
    });

    AuthCode.belongsTo(db.Session, {
      foreignKey: 'session_id',
    });

    AuthCode.belongsTo(db.User, {
      foreignKey: 'user_id',
    });
  };

  return AuthCode;
};
