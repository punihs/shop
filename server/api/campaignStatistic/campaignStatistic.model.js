module.exports = (sequelize, DataTypes) => {
  const CampaignStatistic = sequelize.define('CampaignStatistic', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    coupon_code: DataTypes.STRING,
    url: DataTypes.STRING,
    channel: DataTypes.STRING,
  }, {
    tableName: 'campaigns_statistics',
    timestamps: true,
    underscored: true,
  });

  CampaignStatistic.associate = (db) => {
    CampaignStatistic.belongsTo(db.Campaign);
    CampaignStatistic.belongsTo(db.Customer);
  };

  return CampaignStatistic;
};

