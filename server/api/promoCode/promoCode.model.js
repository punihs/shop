module.exports = (sequelize, DataTypes) => {
  const PromoCode = sequelize.define('PromoCode', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    title: DataTypes.STRING,
    code: DataTypes.STRING,
    cashback: DataTypes.DECIMAL(8, 2),
    discount: DataTypes.INTEGER,
    max_cash_amount: DataTypes.DECIMAL(20, 2),
    validity: DataTypes.DATE,
    url: DataTypes.STRING,
    featured: DataTypes.STRING,
  }, {
    tableName: 'promo_codes',
    timestamps: true,
    underscored: true,
  });

  return PromoCode;
};

