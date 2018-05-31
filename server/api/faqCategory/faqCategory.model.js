
module.exports = (sequelize, DataTypes) => {
  const FaqCategory = sequelize.define('FaqCategory', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
  }, {
    tableName: 'faq_categories',
    timestamps: true,
    underscored: true,
  });

  return FaqCategory;
};
