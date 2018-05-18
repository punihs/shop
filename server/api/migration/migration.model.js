module.exports = (sequelize, DataTypes) => {
  const Migration = sequelize.define('Migration', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    migration: DataTypes.STRING,
    batch: DataTypes.INTEGER,
  }, {
    tableName: 'migrations',
    timestamps: false,
    underscored: true,
  });

  return Migration;
};

