const properties = require('./coupon.property');

module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define('Coupon', properties(DataTypes), {
    tableName: 'coupons',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  return Coupon;
};
