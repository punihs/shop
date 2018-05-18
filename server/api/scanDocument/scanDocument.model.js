module.exports = (sequelize, DataTypes) => {
  const ScanDocument = sequelize.define('ScanDocument', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
  }, {
    tableName: 'scan_documents',
    timestamps: true,
    underscored: true,
  });

  ScanDocument.associate = (db) => {
    ScanDocument.belongsTo(db.Package);
  };

  return ScanDocument;
};

