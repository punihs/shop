module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  name: DataTypes.STRING,
  code: {
    type: DataTypes.STRING(50),
    unique: true,
  },
  cashback_percentage: DataTypes.INTEGER,
  discount_percentage: DataTypes.INTEGER,
  max_cashback_amount: DataTypes.DOUBLE(8, 2),
  expires_at: DataTypes.DATE,
  url: DataTypes.STRING,
  display_in_home_page: DataTypes.BOOLEAN,
  slug: DataTypes.STRING,
});
