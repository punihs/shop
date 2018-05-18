module.exports = (sequelize, DataTypes) => {
  const ShipTracking = sequelize.define('ShipTracking', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    ship_request_date: DataTypes.DATE,
    carrier: DataTypes.STRING,
    box_nos: DataTypes.INTEGER,
    package_weight: DataTypes.DOUBLE,
    package_value: DataTypes.DOUBLE,
    tracking_id: DataTypes.STRING,
    tracking_url: DataTypes.STRING,
  }, {
    tableName: 'ship_trackings',
    timestamps: true,
    underscored: true,
  });

  ShipTracking.associate = (db) => {
    ShipTracking.belongsTo(db.ShipRequest);
  };
  return ShipTracking;
};
