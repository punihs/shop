
module.exports = DataTypes => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: DataTypes.STRING,
  source_id: DataTypes.INTEGER,
  description: DataTypes.STRING(10000),
  rating: DataTypes.INTEGER,
  is_approved: DataTypes.BOOLEAN,
  approved_by: DataTypes.INTEGER,
});
