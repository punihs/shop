const {
  PHOTO_REQUEST_STATUS: { PENDING, COMPLETED },
  PHOTO_REQUEST_TYPE: { STANDARD, ADVANCED },
} = require('../../config/constants');

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
      values: [STANDARD, ADVANCED],
    },
    status: {
      type: DataTypes.ENUM,
      values: [PENDING, COMPLETED],
    },
    description: DataTypes.STRING,
  }, {
    tableName: 'photo_requests',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  PhotoRequest.associate = (db) => {
    PhotoRequest.belongsTo(db.Package);
  };

  return PhotoRequest;
};

