const properties = require('./packageComment.property');

module.exports = (sequelize, DataTypes) => {
  const PackageComment = sequelize.define('PackageComment', properties(DataTypes), {
    tableName: 'package_comments',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  PackageComment.associate = (db) => {
    PackageComment.belongsTo(db.User, {
      foreignKey: 'user_id',
    });

    PackageComment.belongsTo(db.Package, {
      foreignKey: 'package_id',
      defaultScope: { order: 'Package.id DESC' },
    });
  };

  return PackageComment;
};
