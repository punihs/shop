const properties = require('./seo.property');

module.exports = (sequelize, DataTypes) => {
  const Seo = sequelize.define('Seo', properties(DataTypes), {
    tableName: 'seo',
    timestamps: true,
    underscored: true,
  });

  Seo.associate = (db) => {
    Seo.belongsTo(db.User, {
      foreignKey: 'created_by',
    });
  };

  return Seo;
};

