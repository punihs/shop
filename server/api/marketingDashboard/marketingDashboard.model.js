module.exports = (sequelize, DataTypes) => {
  const MarketingDashboard = sequelize.define('MarketingDashboard', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    google_indeces_count_aloak: DataTypes.INTEGER,
    months: DataTypes.STRING,
    sources: DataTypes.STRING,
    expected_shipments: DataTypes.INTEGER,
    actual_shipments: DataTypes.INTEGER,
  }, {
    tableName: 'marketing_dashboard',
    timestamps: false,
    underscored: true,
  });

  return MarketingDashboard;
};

