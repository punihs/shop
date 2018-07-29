const properties = require('./emailPreference.property');

module.exports = (sequelize, DataTypes) => {
  const EmailPreference = sequelize.define('EmailPreference', properties(DataTypes), {
    tableName: 'email_preferences',
    timestamps: true,
    underscored: true,
  });

  EmailPreference.associate = (db) => {
    EmailPreference.belongsTo(db.User);
    EmailPreference.belongsTo(db.EmailTemplate);
  };

  return EmailPreference;
};
