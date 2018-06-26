
const properties = require('./feedback.property');

module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define(
    'Feedback',
    properties(DataTypes),
    {
      tableName: 'feedbacks',
      timestamps: false,
      underscored: true,
    },
  );

  return Feedback;
};

