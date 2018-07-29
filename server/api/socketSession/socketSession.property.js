module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    allowNull: false,
  },
  socket_id: DataTypes.STRING,
  is_online: DataTypes.BOOLEAN,
});
