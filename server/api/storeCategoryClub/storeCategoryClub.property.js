module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  url: DataTypes.STRING(500),
  rank: DataTypes.INTEGER,
  featured: {
    type: DataTypes.ENUM,
    values: ['0', '1'],
  },
  info: DataTypes.STRING(1000),
});
