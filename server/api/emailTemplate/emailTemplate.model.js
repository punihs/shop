module.exports = (sequelize, DataTypes) => {
  const EmailTemplate = sequelize.define('EmailTemplate', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    subject: DataTypes.STRING,
    body: DataTypes.STRING,
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    replyTo: DataTypes.STRING,
    cc: DataTypes.STRING,
    bcc: DataTypes.STRING,
    comments: DataTypes.STRING,
  }, {
    tableName: 'email_templates',
    timestamps: false,
    underscored: true,
  });

  return EmailTemplate;
};

