module.exports = (sequelize, DataTypes) => {
  const ShipmentIssue = sequelize.define('ShipmentIssue', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    shipment_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {
    tableName: 'shipment_issues',
    timestamps: true,
    underscored: true,
  });

  ShipmentIssue.associate = (db) => {
    ShipmentIssue.belongsTo(db.Shipment);
  };
  return ShipmentIssue;
};