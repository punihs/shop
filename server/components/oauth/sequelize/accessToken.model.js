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
  }, {
    tableName: 'access_tokens',
    timestamps: false,
    underscored: true,
    defaultScope: {
      where: { status: 1 },
    },
  });

  AccessToken.associate = function associate(db) {
    AccessToken.belongsTo(db.App, {
      foreignKey: 'app_id',
    });

    AccessToken.belongsTo(db.Session, {
      foreignKey: 'session_id',
    });

    AccessToken.belongsTo(db.User, {
      foreignKey: 'user_id',
    });
  };

  return AccessToken;
};
