
module.exports = DataTypes => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  domain: DataTypes.STRING,
  path: DataTypes.STRING,
  title: DataTypes.STRING,
  meta_title: DataTypes.STRING,
  meta_description: DataTypes.STRING,
});
