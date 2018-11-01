
module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unsigned: true,
    unique: true,
  },
  level: DataTypes.INTEGER,
  points: DataTypes.INTEGER,
  total_points: DataTypes.INTEGER,
});

