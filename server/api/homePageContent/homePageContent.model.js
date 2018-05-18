module.exports = (sequelize, DataTypes) => {
  const HomePageContent = sequelize.define('HomePageContent', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    description: DataTypes.STRING,
  }, {
    tableName: 'home_page_contents',
    timestamps: true,
    underscored: true,
  });

  return HomePageContent;
};

