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
    website: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    billing_contact: DataTypes.STRING,
    admin_contact: DataTypes.STRING,
    tech_contact: DataTypes.STRING,
  }, {
    tableName: 'orgs',
    timestamps: true,
    underscored: true,
  });

  return Org;
};

