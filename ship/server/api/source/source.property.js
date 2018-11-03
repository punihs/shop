module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    allowNull: false,
  },
  name: DataTypes.STRING,
  slug: DataTypes.STRING,
  link: DataTypes.STRING,
});
