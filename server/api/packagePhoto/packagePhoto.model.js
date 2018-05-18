module.exports = (sequelize, DataTypes) => {
  const PackagePhoto = sequelize.define('PackagePhoto', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM,
      values: ['standard', 'advanced'],
    },

  }, {
    tableName: 'package_photos',
    timestamps: true,
    underscored: true,
  });

  PackagePhoto.associate = (db) => {
    PackagePhoto.belongsTo(db.Package);
  };

  return PackagePhoto;
};

