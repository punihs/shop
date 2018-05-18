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
    review: DataTypes.STRING,
    rating: DataTypes.TINYINT,
    approve: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
  }, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
  });

  Review.associate = (db) => {
    Review.belongsTo(db.Country);
  };

  return Review;
};

