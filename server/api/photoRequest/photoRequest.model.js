const properties = require('./photoRequest.property');

module.exports = (sequelize) => {
  const PhotoRequest = sequelize.define('PhotoRequest', properties, {
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

