module.exports = (sequelize, DataTypes) => {
  const UserSource = sequelize.define('UserSource', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
  }, {
    tableName: 'user_sources',
    timestamps: true,
    underscored: true,
  });

  return UserSource;
};

