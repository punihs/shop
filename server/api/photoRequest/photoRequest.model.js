module.exports = (sequelize, DataTypes) => {
  const PhotoRequest = sequelize.define('PhotoRequest', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM,
      values: ['standard', 'advanced'],
    },
    status: {
      type: DataTypes.ENUM,
      values: ['pending', 'completed'],
    },
    description: DataTypes.STRING,
    charge: DataTypes.DECIMAL(8, 2),
  }, {
    tableName: 'photo_requests',
    timestamps:
      true,
    underscored:
      true,
  });

  PhotoRequest.associate = (db) => {
    PhotoRequest.belongsTo(db.Package);
  };

  return PhotoRequest;
};

