module.exports = (sequelize, DataTypes) => {
  const PartnerLink = sequelize.define('PartnerLink', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    url: DataTypes.STRING,
  }, {
    tableName: 'partner_links',
    timestamps: true,
    underscored: true,
  });

  PartnerLink.associate = (db) => {
    PartnerLink.belongsTo(db.ShippingPartner);
  };

  return PartnerLink;
};

