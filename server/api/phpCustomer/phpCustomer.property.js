module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  shipment_count: DataTypes.INTEGER,
});
