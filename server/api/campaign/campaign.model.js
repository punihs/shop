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
    comment: DataTypes.STRING,
    coupon_code: DataTypes.STRING,
    cashback: DataTypes.STRING,
    begin_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    type: DataTypes.STRING,
    image: DataTypes.STRING,
    slug: DataTypes.STRING,
  }, {
    tableName: 'campaigns',
    timestamps: true,
    underscored: true,
  });

  Campaign.associate = (db) => {
    Campaign.belongsTo(db.Customer);
  };

  return Campaign;
};

