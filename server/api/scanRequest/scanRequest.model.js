module.exports = (sequelize, DataTypes) => {
  const ScanRequest = sequelize.define('ScanRequest', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM,
      values: ['full', 'limited'],
    },
    page_from: DataTypes.SMALLINT(6),
    page_to: DataTypes.SMALLINT(6),
    message: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM,
      values: ['pending', 'completed'],
    },
  }, {
    tableName: 'scan_requests',
    timestamps: true,
    underscored: true,
  });

  ScanRequest.associate = (db) => {
    ScanRequest.belongsTo(db.Package);
  };

  return ScanRequest;
};

