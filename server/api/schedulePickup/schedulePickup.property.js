module.exports = DataTypes => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  user_first_name: DataTypes.STRING,
  user_last_name: DataTypes.STRING,
  user_email: DataTypes.STRING,
  phone_code: DataTypes.STRING,
  mobile: DataTypes.STRING,
  number_of_packages: DataTypes.INTEGER,
  package_weight: DataTypes.DECIMAL(10, 2),
  size_of_package: DataTypes.STRING,
  package_items: DataTypes.STRING,
  special_items: DataTypes.STRING(1000),
  other_items: DataTypes.STRING(1000),
  payment_option: DataTypes.STRING,
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  street: DataTypes.STRING(1000),
  pincode: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  contact_no: DataTypes.STRING,
  email: DataTypes.STRING,
  destination_user_first_name: DataTypes.STRING,
  destination_user_last_name: DataTypes.STRING,
  destination_street: DataTypes.STRING,
  destination_state: DataTypes.STRING,
  destination_city: DataTypes.STRING,
  destination_country: DataTypes.STRING,
  destination_pincode: DataTypes.STRING,
  destination_phone_code: DataTypes.STRING,
  destination_contact_no: DataTypes.STRING,
  comment: DataTypes.STRING,
  is_admin_read: {
    type: DataTypes.ENUM,
    values: ['yes', 'no'],
  },
  status: DataTypes.STRING,
  action_comment: DataTypes.STRING,
});
