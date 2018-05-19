module.exports = (sequelize, DataTypes) => {
  const HttpReferrer = sequelize.define('HttpReferrer', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    url: DataTypes.STRING,
  }, {
    tableName: 'http_referrers',
    timestamps: true,
    underscored: true,
  });

  HttpReferrer.associate = (db) => {
    HttpReferrer.belongsTo(db.User);
  };

  return HttpReferrer;
};

