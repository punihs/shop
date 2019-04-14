const properties = require('./socketSession.property');

module.exports = (sequelize, DataTypes) => {
  const SocketSession = sequelize.define('SocketSession', properties(DataTypes), {
    tableName: 'socket_sessions',
    timestamps: false,
    underscored: true,
  });

  SocketSession.associate = (db) => {
    SocketSession.belongsTo(db.User);
    // SocketSession.belongsTo(db.AccessToken);
  };

  return SocketSession;
};

