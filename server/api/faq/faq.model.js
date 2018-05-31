const properties = require('./faq.property');

module.exports = (sequelize, DataTypes) => {
  const Faq = sequelize.define('Faq', properties(DataTypes), {
    tableName: 'faqs',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  Faq.associate = (db) => {
    db.FaqCategory.hasMany(db.Faq);
  };

  return Faq;
};
