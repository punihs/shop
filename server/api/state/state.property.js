
module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER(11),
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  name: DataTypes.STRING(255),
  config: {
    type: DataTypes.STRING(1000),
    validate: {
      len: {
        args: [0, 20],
        msg: 'Maximum length for color field is 20',
      },
    },
  },
  status: {
    type: DataTypes.INTEGER(1),
    validate: {
      isInt: {
        msg: 'status field should be an integer',
      },
      len: {
        args: [0, 1],
        msg: 'Maximum length for status field is 1',
      },
    },
    defaultValue: 1,
  },
});
