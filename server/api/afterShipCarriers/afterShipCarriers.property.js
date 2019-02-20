module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER(11),
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  carrier: DataTypes.STRING,
  slug: DataTypes.STRING,
  active: DataTypes.BOOLEAN,
});
