
const moment = require('moment');

module.exports = function RefreshTokenModel(sequelize, DataTypes) {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    refresh_token: {
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
        return moment().add(1, 'months');
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
    tableName: 'refresh_tokens',
    timestamps: false,
    underscored: true,
    defaultScope: {
      where: { status: 1 },
    },
  });

  RefreshToken.associate = (db) => {
    RefreshToken.belongsTo(db.App, {
      foreignKey: 'app_id',
    });

    RefreshToken.belongsTo(db.User, {
      foreignKey: 'user_id',
    });

    RefreshToken.belongsTo(db.Session, {
      foreignKey: 'session_id',
    });
  };

  return RefreshToken;
};
