module.exports = (sequelize, DataTypes) => {
  const FirstVisit = sequelize.define('FirstVisit', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    url: DataTypes.STRING,
  }, {
    tableName: 'first_visits',
    timestamps: true,
    underscored: true,
  });

  FirstVisit.associate = (db) => {
    FirstVisit.belongsTo(db.Customer);
  };

  return FirstVisit;
};

