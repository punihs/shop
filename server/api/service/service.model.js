module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    code_name: DataTypes.STRING,
    owner: DataTypes.STRING,
    description: DataTypes.STRING,
    image_url: DataTypes.STRING,
    video_url: DataTypes.STRING,
  }, {
    tableName: 'services',
    timestamps: false,
    underscored: true,
  });

  return Service;
};

