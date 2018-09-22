module.exports = DataTypes => ({
  storage_amount: DataTypes.DECIMAL(8, 2),
  wrong_address_amount: DataTypes.DECIMAL(8, 2),
  special_handling_amount: DataTypes.DECIMAL(8, 2),
  receive_mail_amount: DataTypes.DECIMAL(8, 2),
  pickup_amount: DataTypes.DECIMAL(8, 2),
  standard_photo_amount: DataTypes.DECIMAL(8, 2),
  advanced_photo_amount: DataTypes.DECIMAL(8, 2),
  split_package_amount: DataTypes.DECIMAL(8, 2),
  scan_document_amount: DataTypes.DECIMAL(8, 2),
});
