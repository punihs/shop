
module.exports = (sequelize, DataTypes) => {
  const AccountDocument = sequelize.define('AccountDocument', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    document_name: DataTypes.STRING,
  }, {
    tableName: 'account_documents',
    timestamps: true,
    underscored: true,
  });

  AccountDocument.associate = (db) => {
    AccountDocument.belongsTo(db.Customer);
  };

  return AccountDocument;
};

