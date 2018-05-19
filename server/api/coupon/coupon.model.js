module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    cashback_amount: DataTypes.DECIMAL(8, 2),
    discount_percentage: DataTypes.INTEGER,
    max_cash_amt: DataTypes.DECIMAL(20, 2),
    expires_at: DataTypes.DATE,
    is_featured: DataTypes.BOOLEAN,
  }, {
    tableName: 'coupons',
    timestamps: true,
    underscored: true,
  });

  Coupon.associate = (db) => {
    Coupon.hasMany(db.Campaign);
    Coupon.hasMany(db.User);
  };

  return Coupon;
};

