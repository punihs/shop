const properties = require('./emailTemplate.property');

module.exports = function EmployerModel(sequelize, DataTypes) {
  const EmailTemplate = sequelize.define('EmailTemplate', properties(DataTypes), {
    tableName: 'email_templates',
    timestamps: false,
    underscored: true,
  });

  EmailTemplate.associate = (db) => {
    EmailTemplate.hasMany(db.EmailTemplateAd);
    EmailTemplate.belongsTo(db.Group);
  };

  return EmailTemplate;
};
