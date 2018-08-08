const properties = require('./countryGuide.property');

module.exports = (sequelize, DataTypes) => {
  const CountryGuide = sequelize.define('CountryGuide', properties(DataTypes), {
    tableName: 'country_guides',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  CountryGuide.associate = (db) => {
    CountryGuide.belongsTo(db.Country);
  };
  return CountryGuide;
};

