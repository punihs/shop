module.exports = DataTypes => ({
  message_id: DataTypes.STRING,
  to: DataTypes.STRING,
  cc: DataTypes.STRING,
  bcc: DataTypes.STRING,
  terminated_ids: DataTypes.STRING,
});
