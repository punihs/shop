
module.exports = function AppModel(sequelize, DataTypes) {
  const App = sequelize.define('App', {
    id: {
      type: DataTypes.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      validate: {
        len: [5, 255],
      },
      allowNull: false,
    },
    client_id: {
      type: DataTypes.STRING(64),
      unique: true,
      validate: {
        len: [8, 64],
      },
      allowNull: false,
    },
    client_secret: {
      type: DataTypes.STRING(64),
      validate: {
        len: [8, 64],
      },
      allowNull: false,
    },
    redirect_uri: {
      type: DataTypes.STRING(255),
      validate: {
        len: [5, 255],
      },
      allowNull: false,
    },
    port: DataTypes.STRING,
  }, {
    tableName: 'apps',
    timestamps: false,
    underscored: true,
  });

  App.associate = (db) => {
    App.hasMany(db.AccessToken);
    App.hasMany(db.RefreshToken);

    App.belongsTo(db.User, {
      foreignKey: 'user_id',
    });
  };

  return App;
};
