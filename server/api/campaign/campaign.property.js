
module.exports = DataTypes => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
    unique: true,
  },
  name: DataTypes.STRING,
  comment: DataTypes.STRING,
  coupon_code: DataTypes.STRING,
  offer_percentage: DataTypes.INTEGER,
  starts_at: DataTypes.DATE,
  expires_at: DataTypes.DATE,
  offer_type: DataTypes.STRING,
  object: DataTypes.STRING,
  slug: DataTypes.STRING,
});
