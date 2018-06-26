const properties = require('./photoRequest.property');

module.exports = (sequelize, Datatypes) => {
  const PhotoRequest = sequelize.define('PhotoRequest', properties(Datatypes), {
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

