
module.exports = DataTypes => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  response_time: DataTypes.DECIMAL(15, 4),
  body_bytes_sent: DataTypes.STRING,
  status: DataTypes.INTEGER,
  request: DataTypes.TEXT,
  body: DataTypes.JSON,
  query: DataTypes.JSON,
  method: DataTypes.STRING,
  session_id: DataTypes.INTEGER,
});

