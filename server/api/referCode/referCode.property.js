module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    allowNull: false,
  },
  friend: DataTypes.STRING,
  code: DataTypes.STRING,
  referred_url: DataTypes.STRING,
});
