module.exports = (sequelize, DataTypes) => {
  const UserMeta = sequelize.define('UserMeta', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    alt_phone: DataTypes.STRING,
    alt_code: DataTypes.STRING,
    alt_email: DataTypes.STRING,
  }, {
    tableName: 'user_meta',
    timestamps: true,
    underscored: true,
  });

  UserMeta.associate = (db) => {
    UserMeta.belongsTo(db.User);
    UserMeta.belongsTo(db.UserSource);
  };

  return UserMeta;
};

