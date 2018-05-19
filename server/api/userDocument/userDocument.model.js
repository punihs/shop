
module.exports = (sequelize, DataTypes) => {
  const UserDocument = sequelize.define('UserDocument', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    document_name: DataTypes.STRING,
  }, {
    tableName: 'user_documents',
    timestamps: true,
    underscored: true,
  });

  UserDocument.associate = (db) => {
    UserDocument.belongsTo(db.User);
  };

  return UserDocument;
};

