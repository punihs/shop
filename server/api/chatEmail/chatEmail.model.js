module.exports = (sequelize, DataTypes) => {
  const ChatEmail = sequelize.define('ChatEmail', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    email_subject: DataTypes.STRING,
    mobile: DataTypes.STRING,
    address: DataTypes.STRING,
    query: DataTypes.STRING,
    answer: DataTypes.STRING,
    sender_name: DataTypes.STRING,
    chat_date: DataTypes.DATE,
    information_url: DataTypes.STRING,
  }, {
    tableName: 'chat_emails',
    timestamps: true,
    underscored: true,
  });

  return ChatEmail;
};

