module.exports = (sequelize, DataTypes) => {
  const Org = sequelize.define('Org', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
  }, {
    tableName: 'orgs',
    timestamps: true,
    underscored: true,
  });

  Org.associate = (db) => {
    Org.belongsTo(db.User);
  };

  return Org;
};

