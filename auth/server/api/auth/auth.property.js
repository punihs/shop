
module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  salutation: DataTypes.STRING,
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: {
      args: true,
      message: 'Email address already in use!',
    },
    validate: {
      isEmail: {
        args: true,
        msg: 'Please input a valid email',
      },
      max: {
        args: 64,
        msg: 'Email id must less than 64 characters.',
      },
    },
  },
  password: DataTypes.STRING,

  profile_photo_url: DataTypes.STRING,

  phone: DataTypes.STRING,

  medium: DataTypes.STRING,
  google_contacts_accessed: DataTypes.BOOLEAN,
  otp: DataTypes.STRING,
  facebook: DataTypes.JSON,
  twitter: DataTypes.JSON,
  google: DataTypes.JSON,
  github: DataTypes.JSON,
});
