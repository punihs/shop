module.exports = (sequelize, DataTypes) => {
  const Keyword = sequelize.define('Keyword', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    object_id: DataTypes.INTEGER,
  }, {
    tableName: 'keywords',
    timestamps: true,
    underscored: true,
  });

  Keyword.associate = (db) => {
    Keyword.belongsTo(db.ObjectType);
  };

  return Keyword;
};

