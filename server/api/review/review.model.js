module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    person: DataTypes.STRING,
    source: DataTypes.STRING,
    review: DataTypes.TEXT,
    rating: DataTypes.INTEGER,
    approve: DataTypes.BOOLEAN,
  }, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
  });

  Review.associate = (db) => {
    Review.belongsTo(db.Country);
    Review.belongsTo(db.Shipment);
  };

  return Review;
};

