const properties = require('./place.property');

module.exports = (sequelize, DataTypes) => {
  const Place = sequelize.define('Place', properties(DataTypes), {
    tableName: 'places',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });


  Place.associate = (db) => {
    Place.belongsTo(db.User, {
      foreignKey: 'user_id',
      as: 'User',
    });
    Place.belongsTo(db.Place, {
      foreignKey: 'parent_id',
      as: 'Parent',
    });
  };

  return Place;
};

