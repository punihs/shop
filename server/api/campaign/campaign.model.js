module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define('Campaign', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    github_issue_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    comment: DataTypes.STRING,
    begins_at: DataTypes.DATE,
    ends_at: DataTypes.DATE,
    type: DataTypes.STRING,
    image: DataTypes.STRING,
  }, {
    tableName: 'campaigns',
    timestamps: true,
    underscored: true,
  });

  Campaign.associate = (db) => {
    Campaign.belongsTo(db.User);
    Campaign.hasOne(db.Coupon);
  };

  return Campaign;
};

