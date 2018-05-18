module.exports = (sequelize, DataTypes) => {
  const UrlFeedback = sequelize.define('UrlFeedback', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    feedback: DataTypes.STRING,
  }, {
    tableName: 'url_feedbacks',
    timestamps: true,
    underscored: true,
  });

  return UrlFeedback;
};
