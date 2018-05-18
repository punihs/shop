module.exports = (sequelize, DataTypes) => {
  const PromoCodeApplied = sequelize.define('PromoCodeApplied', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    shipment_id: DataTypes.STRING,
    coupon_code: DataTypes.STRING,
    discount_amount: DataTypes.DECIMAL(20, 2),
    status: DataTypes.STRING,
  }, {
    tableName: 'promo_code_applied',
    timestamps: true,
    underscored: true,
  });

  return PromoCodeApplied;
};

