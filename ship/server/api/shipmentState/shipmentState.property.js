

module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER(14),
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  shipment_id: {
    type: DataTypes.INTEGER(14),
    allowNull: false,
  },
  state_id: {
    type: DataTypes.INTEGER(14),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER(14),
    allowNull: false,
  },
  comments: { type: DataTypes.TEXT() },
  status: {
    type: DataTypes.INTEGER(1),
    defaultValue: 1,
  },
});
