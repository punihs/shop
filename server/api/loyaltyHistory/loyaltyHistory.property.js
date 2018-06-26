
module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unsigned: true,
    unique: true,
  },
  points: DataTypes.INTEGER,
  type: DataTypes.STRING,
  description: DataTypes.STRING,
});

