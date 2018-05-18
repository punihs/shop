module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
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
    is_loyalty_points_added: DataTypes.TINYINT,
  }, {
    tableName: 'feedbacks',
    timestamps: true,
    underscored: true,
  });

  return Feedback;
};

