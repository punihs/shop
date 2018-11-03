
module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('Country', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    iso2: DataTypes.STRING,
    iso3: DataTypes.STRING,
    phone_code: DataTypes.INTEGER,
    currency_code: DataTypes.STRING,
    capital_city: DataTypes.STRING,
    flag: DataTypes.STRING,
    discount_percentage: DataTypes.INTEGER,
    is_shipping_available: DataTypes.BOOLEAN,
  }, {
    tableName: 'countries',
    timestamps: false,
    underscored: true,
  });

  return Country;
};

