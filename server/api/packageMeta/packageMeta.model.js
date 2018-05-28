const properties = require('./packageMeta.property');

module.exports = (sequelize, DataTypes) => {
  const PackageMeta = sequelize.define('PackageMeta', properties(DataTypes), {
    tableName: 'package_meta',
    timestamps: false,
    paranoid: true,
    underscored: true,
  });
  PackageMeta.associate = (db) => {
    PackageMeta.belongsTo(db.Package, {
      foreignKey: 'id',
    });
  };

  return PackageMeta;
};

