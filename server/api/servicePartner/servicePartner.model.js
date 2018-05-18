module.exports = (sequelize, DataTypes) => {
  const ServicePartner = sequelize.define('ServicePartner', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    website: DataTypes.STRING,
    results_url: DataTypes.STRING,
  }, {
    tableName: 'service_partners',
    timestamps: false,
    underscored: true,
  });

  return ServicePartner;
};

