const properties = require('./emailLog.property');

module.exports = function EmailLogModel(sequelize, DataTypes) {
  const EmailLog = sequelize.define('EmailLog', properties(DataTypes), {
    tableName: 'email_logs',
    timestamps: true,
    underscored: true,
  });

  EmailLog.associate = (db) => {
    EmailLog.belongsTo(db.User);
    EmailLog.belongsTo(db.EmailTemplate);
    EmailLog.belongsTo(db.Ad);
  };

  return EmailLog;
};
