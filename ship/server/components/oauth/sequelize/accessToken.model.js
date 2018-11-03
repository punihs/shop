const moment = require('moment');

module.exports = function AccessTokenModel(sequelize, DataTypes) {
  const AccessToken = sequelize.define('AccessToken', {
    id: {
      type: DataTypes.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    access_token: {
      type: DataTypes.STRING(256),
      validate: {
        len: {
          args: [10, 256],
          msg: 'Maximum length for value field is 255',
        },
      },
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: function setExpires() {
        return moment().add(1, 'hours');
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
    scope: DataTypes.STRING(256),
    user_type: DataTypes.STRING,
    app_id: DataTypes.INTEGER,
    session_id: DataTypes.INTEGER,
    auth_id: DataTypes.INTEGER,
  }, {
    tableName: 'access_tokens',
    timestamps: false,
    underscored: true,
    defaultScope: {
      where: { status: 1 },
    },
  });


  return AccessToken;
};
