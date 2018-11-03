const properties = require('./source.property');

module.exports = (sequelize, DataTypes) => {
  const Source = sequelize.define('Source', properties(DataTypes), {
    tableName: 'sources',
    timestamps: false,
    underscored: true,
  });

  Source.associate = (db) => {
    Source.hasMany(db.Review);
  };
  return Source;
};

