
module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define('Announcement', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    message: DataTypes.STRING,
    validity: DataTypes.DATE,
    featured: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
  }, {
    tableName: 'announcements',
    timestamps: true,
    underscored: true,
  });

  return Announcement;
};

