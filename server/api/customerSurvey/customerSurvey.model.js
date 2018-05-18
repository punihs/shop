module.exports = (sequelize, DataTypes) => {
  const CustomerSurvey = sequelize.define('CustomerSurvey', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    full_name: DataTypes.STRING,
    email: DataTypes.STRING,
    country_id: DataTypes.INTEGER,
    source: DataTypes.STRING,
    age: DataTypes.STRING,
    family_income_group: DataTypes.STRING,
  }, {
    tableName: 'customer_surveys',
    timestamps: true,
    underscored: true,
  });
  CustomerSurvey.associate = (db) => {
    CustomerSurvey.belongsTo(db.Customer);
  }

  return CustomerSurvey;
};

