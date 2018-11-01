
module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unsigned: true,
    unique: true,
  },
  player_id: DataTypes.STRING,
});

