
module.exports = (sequelize, DataTypes) => {
  const PackageMeta = sequelize.define('PackageMeta', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    storage_amount: DataTypes.DECIMAL(8, 2),
    wrong_address_amount: DataTypes.DECIMAL(8, 2),
    special_handlig_amount: DataTypes.DECIMAL(8, 2),
    charge_amount: DataTypes.DECIMAL(8, 2),
    pickup_amount: DataTypes.DECIMAL(8, 2),
    basic_photo_amount: DataTypes.DECIMAL(8, 2),
    standard_photo_amount: DataTypes.DECIMAL(8, 2),
    split_charge_amount: DataTypes.DECIMAL(8, 2),
    scan_doc_amount: DataTypes.DECIMAL(8, 2),
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

