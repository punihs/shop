module.exports = (sequelize, DataTypes) => {
  const RefferCode = sequelize.define('RefferCode', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    friend: DataTypes.STRING,
    code: DataTypes.STRING,
    referred_url: DataTypes.STRING,
  }, {
    tableName: 'reffer_codes',
    timestamps: true,
    underscored: true,
  });

  RefferCode.associate = (db) => {
    RefferCode.belongsTo(db.Customer);
  };

  return RefferCode;
};

