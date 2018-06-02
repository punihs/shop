module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    source_id: DataTypes.INTEGER,
    description: DataTypes.STRING(10000),
    rating: DataTypes.INTEGER,
    is_approved: DataTypes.BOOLEAN,
    approved_by: DataTypes.INTEGER,
  }, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
  });

  Review.associate = (db) => {
    Review.belongsTo(db.Shipment);
    Review.belongsTo(db.User, {
      foreignKey: 'customer_id',
    });
  };

  return Review;
};

