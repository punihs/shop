

module.exports = function SessionModel(sequelize, DataTypes) {
  const Session = sequelize.define('Session', {
    id: {
      type: DataTypes.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    device: DataTypes.STRING,
    os: DataTypes.STRING,
    browser: DataTypes.STRING,
    country: DataTypes.STRING,
    region: DataTypes.STRING,
    city: DataTypes.STRING,
    ip: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    metro: DataTypes.STRING,
    zip: DataTypes.STRING,
  }, {
    tableName: 'sessions',
    timestamps: false,
    underscored: true,

    classMethods: {
      associate(db) {
        Session.hasMany(db.AccessToken, {
          foreignKey: 'session_id',
        });

        Session.hasMany(db.AuthCode, {
          foreignKey: 'session_id',
        });

        Session.hasMany(db.RefreshToken, {
          foreignKey: 'session_id',
        });

        Session.belongsTo(db.User, {
          foreignKey: 'user_id',
        });
      },
    },
  });

  return Session;
};
