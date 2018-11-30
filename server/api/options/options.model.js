const properties = require('./options.property');

module.exports = (sequelize, DataTypes) => {
  const options = sequelize.define('Options', properties(DataTypes), {
    tableName: 'options',
    timestamps: true,
    underscored: true,
    paranoi: true,
  });
  return options;
};
