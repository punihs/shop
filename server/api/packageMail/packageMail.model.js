module.exports = (sequelize, DataTypes) => {
  const PackageMail = sequelize.define('PackageMail', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    condition: DataTypes.STRING,
  }, {
    tableName: 'package_mails',
    timestamps: true,
    underscored: true,
  });

  PackageMail.associations = (db) => {
    PackageMail.belongsTo(db.packages);
  };
  return PackageMail;
};

