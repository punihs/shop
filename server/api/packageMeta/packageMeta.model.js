
module.exports = (sequelize, DataTypes) => {
  const PackageMeta = sequelize.define('PackageMeta', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'package_meta',
    timestamps: false,
    paranoid: true,
    underscored: true,
  });
  PackageMeta.associate = (db) => {
    PackageMeta.belongsTo(db.Package);
  };

  return PackageMeta;
};

