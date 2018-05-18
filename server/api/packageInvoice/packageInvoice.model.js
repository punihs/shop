module.exports = (sequelize, DataTypes) => {
  const PackageInvoice = sequelize.define('PackageInvoice', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    invoice: DataTypes.STRING,
  }, {
    tableName: 'package_invoices',
    timestamps: true,
    underscored: true,
  });

  PackageInvoice.associate = (db) => {
    PackageInvoice.belongsTo(db.Customer);
  };

  return PackageInvoice;
};

