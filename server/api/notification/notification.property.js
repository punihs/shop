
module.exports = DataTypes => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
    unique: true,
  },
  action_type: DataTypes.STRING,
  action_id: DataTypes.INTEGER,
  action_description: DataTypes.STRING,
  solve_status: DataTypes.STRING,
});
