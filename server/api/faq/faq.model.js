module.exports = (sequelize, DataTypes) => {
  const Faq = sequelize.define('Faq', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    question: DataTypes.STRING,
    answer: DataTypes.STRING,
  }, {
    tableName: 'faqs',
    timestamps: true,
    underscored: true,
  });

  Faq.associate = (db) => {
    Faq.belongsTo(db.FaqCategory);
  };

  return Faq;
};

