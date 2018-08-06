
const properties = require('./review.property');

module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    'Review',
    properties(DataTypes),
    {
      tableName: 'reviews',
      timestamps: true,
      underscored: true,
    },
  );

  Review.associate = (db) => {
    Review.belongsTo(db.Shipment);
    Review.belongsTo(db.Source);
    Review.belongsTo(db.Country);
    Review.belongsTo(db.User, {
      foreignKey: 'customer_id',
    });
  };

  return Review;
};

