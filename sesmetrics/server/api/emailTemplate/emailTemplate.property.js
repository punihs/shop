module.exports = DataTypes => ({
  name: {
    type: DataTypes.STRING,
    unique: true,
  },
  description: DataTypes.STRING,
  type: DataTypes.STRING,
  subject: DataTypes.STRING,
  body: DataTypes.TEXT,
  to: DataTypes.STRING,
  cc: DataTypes.STRING,
  bcc: DataTypes.STRING,
  comments: DataTypes.STRING,
});
