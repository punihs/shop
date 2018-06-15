const properties = require('./source.property');

module.exports = (sequelize, DataTypes) => {
  const Source = sequelize.define('Source', properties(DataTypes), {
    tableName: 'sources',
    timestamps: false,
    underscored: true,
  });

  return Source;
};

