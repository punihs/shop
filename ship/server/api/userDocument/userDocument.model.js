const properties = require('./userDocument.property');

module.exports = (sequelize, DataTypes) => {
  const UserDocument = sequelize.define('UserDocument', properties(DataTypes), {
    tableName: 'user_documents',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  UserDocument.associate = (db) => {
    UserDocument.belongsTo(db.User, {
      foreignkey: 'customer_id',
      as: 'Customer',
    });
  };

  return UserDocument;
};
