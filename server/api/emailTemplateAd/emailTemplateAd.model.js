
module.exports = (sequelize) => {
  const EmailTemplateAd = sequelize.define('EmailTemplateAd', {}, {
    tableName: 'email_template_ads',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  EmailTemplateAd.associate = (db) => {
    EmailTemplateAd.belongsTo(db.Ad);
    EmailTemplateAd.belongsTo(db.EmailTemplate);
  };

  return EmailTemplateAd;
};
