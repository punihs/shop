
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
    underscored: true,
  });

  return PackageMeta;
};

