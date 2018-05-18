module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define('Page', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    content: DataTypes.STRING,
    meta_title: DataTypes.STRING,
    meta_description: DataTypes.STRING,
    meta_keyword: DataTypes.STRING,
  }, {
    tableName: 'pages',
    timestamps: true,
    underscored: true,
  });

  return Page;
};

