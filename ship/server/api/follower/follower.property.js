module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  // points to multiple tables fk without constraint
  object_id: DataTypes.INTEGER,
  object_type_id: DataTypes.INTEGER, // 1 - Packages 2 - Shipments
});
