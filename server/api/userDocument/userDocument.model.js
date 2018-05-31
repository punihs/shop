
module.exports = (sequelize, DataTypes) => {
  const UserDocument = sequelize.define('UserDocument', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    object: DataTypes.STRING,
  }, {
    tableName: 'user_documents',
    paranoid: true,
    timestamps: true,
    underscored: true,
  });

  UserDocument.associate = (db) => {
    UserDocument.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };
  return UserDocument;
};

