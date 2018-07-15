

module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER(11),
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  comments: {
    type: DataTypes.STRING(1024),
    validate: {
      len: {
        args: [0, 1024],
        msg: 'Maximum length for comment field is 1024',
      },
    },
    allowNull: false,
  },
  type: DataTypes.INTEGER,
  object_id: DataTypes.INTEGER,
});
