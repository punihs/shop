module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    allowNull: false,
  },
  name: DataTypes.STRING,
  slug: DataTypes.STRING,
  alias: DataTypes.STRING,
  type: DataTypes.STRING,
  ref_id: DataTypes.STRING,
  metro: DataTypes.STRING,
  longitude: DataTypes.STRING,
  latitude: DataTypes.STRING,
  verified: DataTypes.TINYINT,
});
