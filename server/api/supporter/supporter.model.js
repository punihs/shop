module.exports = (sequelize, DataTypes) => {
  const Supporter = sequelize.define('Supporter', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.INTEGER,
    birth_date_at: DataTypes.DATE,
    department: DataTypes.STRING,
  }, {
    tableName: 'supporters',
    timestamps: false,
    underscored: true,
  });

  return Supporter;
};

