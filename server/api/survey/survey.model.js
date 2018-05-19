module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define('Survey', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    source: DataTypes.STRING,
    age: DataTypes.STRING,
    family_income_group: DataTypes.STRING,
  }, {
    tableName: 'user_surveys',
    timestamps: true,
    underscored: true,
  });
  Survey.associate = (db) => {
    Survey.belongsTo(db.User);
    Survey.belongsTo(db.Country);
  };

  return Survey;
};

