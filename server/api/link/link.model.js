module.exports = (sequelize, DataTypes) => {
  const Link = sequelize.define('Link', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    object_id: DataTypes.INTEGER,
    url: DataTypes.STRING,
  }, {
    tableName: 'links',
    timestamps: true,
    underscored: true,
  });

  Link.associate = (db) => {
    Link.belongsTo(db.ObjectType);
  };

  return Link;
};

