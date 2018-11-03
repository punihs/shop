
module.exports = DataTypes => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  person: DataTypes.STRING,
  email: DataTypes.STRING,
  customer_service: DataTypes.TINYINT,
  arrive_expectation: DataTypes.TINYINT,
  protected_shipment: DataTypes.TINYINT,
  package_condition: DataTypes.TINYINT,
  easy_service: DataTypes.TINYINT,
  overall_level_of_satisfaction: DataTypes.TINYINT,
  suggestions: DataTypes.STRING,
  is_loyalty_points_added: DataTypes.INTEGER,
});

