module.exports = DataTypes => ({
  timestamp: DataTypes.DATE,
  service_event_code: DataTypes.STRING,
  service_event_description: DataTypes.STRING,
  signatory: DataTypes.STRING,
  service_area_code: DataTypes.STRING,
  service_area_dscription: DataTypes.STRING,
});
