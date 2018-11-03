
module.exports = DataTypes => ({
  group_id: {
    type: DataTypes.INTEGER(11),
    autoIncrement: false,
    primaryKey: true,
  },
  state_id: {
    type: DataTypes.INTEGER(11),
    autoIncrement: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(225),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(225),
    allowNull: true,
  },
});
