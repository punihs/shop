module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  banner_img: DataTypes.STRING,
  dutytax: DataTypes.STRING(1000),
  dutytax_meta: DataTypes.STRING,
  transits: DataTypes.STRING(1000),
  transits_meta: DataTypes.STRING,
  forbidden: DataTypes.STRING(1000),
  forbidden_meta: DataTypes.STRING,
  video_url: DataTypes.STRING,
  video_head: DataTypes.STRING(1000),
  video_desc: DataTypes.STRING,
});
