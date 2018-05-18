module.exports = (sequelize, DataTypes) => {
  const Dump = sequelize.define('Dump', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    user: DataTypes.STRING,
    contacts: DataTypes.STRING,
  }, {
    tableName: 'dumps',
    timestamps: false,
    underscored: true,
  });

  return Dump;
};

