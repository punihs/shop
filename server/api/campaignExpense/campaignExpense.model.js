module.exports = (sequelize, DataTypes) => {
  const CampaignExpense = sequelize.define('CampaignExpense', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    amount: DataTypes.STRING,
    comments: DataTypes.STRING,
  }, {
    tableName: 'campaign_expenses',
    timestamps: false,
    underscored: true,
  });

  CampaignExpense.associate = (db) => {
    CampaignExpense.belongsTo(db.Campaign);
  };

  return CampaignExpense;
};

