module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name_of_employee: DataTypes.STRING,
    joining_date: DataTypes.DATE,
    employee_code: DataTypes.STRING,
    contact_number: DataTypes.INTEGER,
    emergency_number: DataTypes.INTEGER,
    official_email_id: DataTypes.STRING,
    personal_email_id: DataTypes.STRING,
    date_of_birth: DataTypes.DATE,
    gender: DataTypes.STRING,
    blood_group: DataTypes.STRING,
    aadhar_number: DataTypes.STRING,
    pan_number: DataTypes.STRING,
    department: DataTypes.STRING,
    designation: DataTypes.STRING,
    line_manager: DataTypes.STRING,
    temporary_address: DataTypes.STRING,
    permanent_address: DataTypes.STRING,
    fathers_name: DataTypes.STRING,
    fathers_dob: DataTypes.DATE,
    mothers_name: DataTypes.STRING,
    mothers_dob: DataTypes.DATE,
    name_of_spouse: DataTypes.STRING,
    spouse_dob: DataTypes.DATE,
    name_of_nominee: DataTypes.STRING,
    relation_to_nominee: DataTypes.STRING,
    referred_by: DataTypes.STRING,
  }, {
    tableName: 'employees',
    timestamps: true,
    underscored: true,
  });

  return Employee;
};
