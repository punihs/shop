module.exports = (sequelize, DataTypes) => {
  const CountryGuide = sequelize.define('CountryGuide', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    country_id: DataTypes.INTEGER,
    banner_img: DataTypes.STRING,
    dutytax: DataTypes.STRING,
    dutytax_meta: DataTypes.STRING,
    transits: DataTypes.STRING,
    transits_meta: DataTypes.STRING,
    forbidden: DataTypes.STRING,
    forbidden_meta: DataTypes.STRING,
    video_url: DataTypes.STRING,
    video_head: DataTypes.STRING,
    video_desc: DataTypes.STRING,
  }, {
    tableName: 'country_guides',
    timestamps: true,
    underscored: true,
  });

  return CountryGuide;
};

