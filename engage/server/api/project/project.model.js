const properties = require('./project.property');

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', properties(DataTypes), {
    tableName: 'projects',
    timestamps: true,
    underscored: true,
  });

  Project.associate = (db) => {
    Project.hasMany(db.Ad);
    Project.hasMany(db.EmailTemplate);
  };

  return Project;
};
