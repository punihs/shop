const properties = require('./ad.property');

module.exports = (sequelize, DataTypes) => {
  const Ad = sequelize.define('Ad', properties(DataTypes), {
    tableName: 'ads',
    timestamps: true,
    underscored: true,
  });

  Ad.associate = (db) => {
    Ad.hasMany(db.EmailTemplateAd);
  };

  return Ad;
};
